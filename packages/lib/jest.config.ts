import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'
import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
    roots: ['<rootDir>'],
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    testMatch: ['**/tests/**/*.spec.ts'],
    preset: 'ts-jest',
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    verbose: true,
    useStderr: true,
    resetModules: true,
    testEnvironment: 'jsdom',
    testTimeout: 5000
}

export default jestConfig
