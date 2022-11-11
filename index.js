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
    core.startGroup(`Auditing ${repository.full_name}`);

    const collaborators = await octokit.paginate(octokit.rest.repos.listCollaborators, {
      owner: repository.owner.login,
      repo: repository.name,
      per_page: 100,
    });

    for (const collaborator of collaborators) {
      core.info(`- ${collaborator.login}: ${normalizePermission(collaborator.permissions)}`);
    }
    
    repositories.push(toLogItem(repository, collaborators));
    core.endGroup();
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
function toLogItem(repository, collaborators) {
  return {
    id: repository.id,
    name: repository.name,
    collaborators: collaborators.map((collaborator) => {
      return {
        login: collaborator.login,
        // team.permissions is currently missing in types,
        // see https://github.com/github/rest-api-description/issues/289
        permission: normalizePermission(collaborator.permissions),
      };
    }),
  };
}
