import { GithubEnv } from '@app/providers/github/utils'
import { upperFirst } from 'lodash'

export default async function getAccessToken(code: string, githubEnv: GithubEnv) {
  return fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    /* eslint-disable camelcase */
    body: JSON.stringify({
      client_id: githubEnv.clientId,
      client_secret: githubEnv.clientSecret,
      code,
    }),
  }).then((res) => res.json())
}

export async function getUserInfo(accessToken: string, tokenType: string) {
  return fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `${upperFirst(tokenType) ?? 'Bearer'} ${accessToken}`,
    },
  }).then((res) => res.json())
}

export type RepositoryData = {
  name: string
  nameWithOwner: string
  owner: string
  avatarUrl: string
}
// TODO fetch last commit info and move in seprate file
export async function getRepositories(token: string) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
					viewer {
					  repositories(last: 100){
						nodes{
						  name
							url
							nameWithOwner
							owner {
							  avatarUrl
							}
						}
					  }
					  repositoriesContributedTo(last: 100){
						nodes{
						 name
							url
							nameWithOwner
							owner {
							  avatarUrl
							}
						}
					  }
					  pullRequests(first: 100) {
						nodes {
						  title
						  repository {
							name
							url
							nameWithOwner
							owner {
							  avatarUrl
							}
						  }
						}
					  }
					}
				  }`,
    }),
  })
  const data = await res.json()
  const repositories: RepositoryData[] = []
  const seen = new Set()
  ;['pullRequests', 'repositoriesContributedTo', 'repositories'].forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.data.viewer[key].nodes.forEach((item: any) => {
      const repository = key === 'pullRequests' ? item.repository : item
      if (!seen.has(repository.nameWithOwner)) {
        seen.add(repository.nameWithOwner)
        repositories.push({
          name: repository.name,
          nameWithOwner: repository.nameWithOwner,
          owner: repository.nameWithOwner.split('/')[0],
          avatarUrl: repository.owner.avatarUrl,
        })
      }
    })
  })
  return repositories
}
