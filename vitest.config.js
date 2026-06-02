/// <reference types="vitest" />
module.exports = {
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/.claude/worktrees/**'
    ]
  }
}
