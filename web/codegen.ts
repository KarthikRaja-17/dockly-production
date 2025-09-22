import path from 'node:path'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	schema: [
		{
			'https://api.quiltt.io/v1/graphql': {
				headers: {
					Authorization: `Bearer qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d`,
				},
			},
		},
	],
	generates: {
		'./src/generated/graphql.ts': {
			plugins: ['typescript', 'typescript-operations'],
			config: {
				skipTypename: false,
				withHooks: true,
				withHOC: false,
				withComponent: false,
			},
		},
	},
}

export default config
