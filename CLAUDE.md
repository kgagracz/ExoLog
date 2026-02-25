# Claude Code Instructions

## File Access
- Only read and modify files within `src/` directory.
- Never read or access `.env` files.

## Documentation
- After implementing a new feature, add a short description of it to `README.MD`.

## Git
- Never execute `git commit` or `git push` commands.

## Commit Messages
- Commit message format: `feat(Module) - short description in English`
- Module should reflect the area of change (e.g. Community, Animals, Auth, Feeding, Events, Navigation).
- Description must be a single sentence in English.
- Example: `feat(Community) - automatically follow users when accepting a friend request`
- Return commit message after every prompt
