const core = require("@actions/core");
const { App } = require("octokit");

require("dotenv").config();

const app = new App({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
});

run();

async function run() {
  const { data: appInfo } = await app.octokit.rest.apps.getAuthenticated();
  core.debug(`Authenticated as ${appInfo.name} (${appInfo.html_url})`);

  const repositories = [];
  for await (const { octokit, repository } of app.eachRepository.iterator()) {
    core.info(`Auditing ${repository.full_name}`);

    const teams = await octokit.paginate(octokit.rest.repos.listTeams, {
      owner: repository.owner.login,
      repo: repository.name,
      per_page: 100,
    });

    for (const team of teams) {
      core.info(`- ${team.name}: ${normalizePermission(team.permissions)}`);
    }

    repositories.push(toLogItem(repository, teams));
  }

  core.setOutput("repositories", JSON.stringify(repositories));
}

/**
 * Turn a repository object from the "List team repositories" endpoint into
 * a permission string which maps the team's permission given to that repository
 *
 * @see https://docs.github.com/en/rest/reference/teams#list-team-repositories
 * @param {import("@octokit/openapi-types").components["schemas"]["team-repository"]["permissions"]} permissions
 */
function normalizePermission(permissions) {
  const { admin, maintain, push, triage, pull } = permissions || {};
  if (admin) return "admin";
  if (maintain) return "maintain";
  if (push) return "write";
  if (triage) return "triage";
  if (pull) return "read";
}

/**
 *
 * @param {import("@octokit/openapi-types").components["schemas"]["repository"]} repository
 * @param {import("@octokit/openapi-types").components["schemas"]["team"][]} teams
 */
function toLogItem(repository, teams) {
  return {
    id: repository.id,
    name: repository.name,
    teams: teams.map((team) => {
      return {
        id: team.id,
        slug: team.slug,
        name: team.name,
        // team.permissions is currently missing in types,
        // see https://github.com/github/rest-api-description/issues/289
        permission: normalizePermission(team.permissions),
      };
    }),
  };
}
