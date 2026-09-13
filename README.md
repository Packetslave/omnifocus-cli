# OmniFocus CLI

[![npm version](https://img.shields.io/npm/v/@stephendolan/omnifocus-cli.svg)](https://www.npmjs.com/package/@stephendolan/omnifocus-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A command-line interface for OmniFocus on macOS.

## Installation

```bash
bun install -g @stephendolan/omnifocus-cli
```

Requires [Bun](https://bun.sh) and macOS with OmniFocus installed.

## Quick Start

```bash
of inbox count                              # Check inbox
of task list --flagged                      # Flagged tasks
of task create "Buy groceries"              # Quick capture
of task update "Buy groceries" --complete   # Mark done
```

## Commands

### Tasks

```bash
of task list                        # List active tasks
of task list --flagged              # Flagged tasks only
of task list --project "Work"       # Filter by project
of task list --tag "urgent"         # Filter by tag
of task list --completed            # Include completed
of task list --parent "Work"        # Direct children of a task (action group)

of task create "Name" [options]
  --project <name>                  # Assign to project
  --parent <name|id>                # Nest under a task (action group); not with --project
  --tag <tags...>                   # Add tags
  --due <YYYY-MM-DD>                # Set due date
  --defer <YYYY-MM-DD>              # Set defer date
  --flagged                         # Flag the task
  --estimate <minutes>              # Time estimate
  --note <text>                     # Add note

of task update <name|id> [options]
  --complete / --incomplete         # Mark completed/incomplete
  --drop / --undrop                 # Mark dropped/restore to active
  --flag / --unflag                 # Toggle flag
  --name <new-name>                 # Rename
  --parent <name|id>                # Move under a task (action group)
  --no-parent                       # Un-nest to the top level of its project or the inbox
  --project/--tag/--due/--defer     # Same as create

of task view <name|id>              # View details
of task delete <name|id>            # Delete task
of task delete <name|id> --force    # Also delete an action group or project root (cascades)
```

`task delete` refuses to delete a task that has children, or a project's root task, unless
`--force` is given — either would silently delete everything under it.

### Projects

```bash
of project list                     # List active projects
of project list --folder "Work"     # Filter by folder
of project list --status "on hold"  # Filter by status
of project list --dropped           # Include dropped

of project create "Name" [options]
  --folder <name>                   # Assign to folder
  --tag <tags...>                   # Add tags
  --sequential                      # Sequential project
  --note <text>                     # Add note

of project view <name|id>           # View details
of project delete <name|id>         # Delete project
```

### Tags

```bash
of tag list                         # All tags with counts
of tag list --unused-days 30        # Stale tags
of tag list --sort usage            # Most used first
of tag list --sort activity         # Most recent first
of tag list --active-only           # Only count incomplete tasks

of tag stats                        # Usage statistics

of tag create "Name"                # Create tag
of tag create "Child" --parent "Parent"  # Nested tag

of tag view <name|path|id>          # View details
of tag update <name> --name "New"   # Rename
of tag update <name> --inactive     # Deactivate
of tag delete <name>                # Delete tag
```

### Inbox

```bash
of inbox list                       # Top-level inbox items (groups carry childCount)
of inbox list --all                 # Include children of action groups, flat
of inbox count                      # Top-level inbox count
of inbox add "Task name"            # Add task to inbox
of inbox add "Task name" --parent "Work"   # Add under an inbox action group
```

### Perspectives

```bash
of perspective list                 # List all perspectives
of perspective view "Forecast"      # View tasks in perspective
```

### Folders

```bash
of folder list                      # List all folders
of folder list --dropped            # Include dropped
of folder view "Work"               # View folder details
```

### Statistics

```bash
of task stats                       # Task statistics
of project stats                    # Project statistics
of tag stats                        # Tag statistics
```

### Other

```bash
of search "query"                   # Search tasks
```

### MCP Server

Run as an MCP server for AI agent integration:

```bash
of mcp
```

## JSON Output

All commands output JSON. Use `--compact` for single-line output.

```bash
of task list | jq 'length'                    # Count tasks
of task list | jq '.[] | .name'               # Task names
of task list --flagged | jq '.[] | {name, due}'  # Specific fields
```

## Task Schema

```json
{
  "id": "kXu3B-LZfFH",
  "name": "Task name",
  "completed": false,
  "dropped": false,
  "effectivelyActive": true,
  "flagged": true,
  "project": "Project Name",
  "parentId": "aBcDeFgHiJk",
  "parent": "Parent task name",
  "childCount": 0,
  "remainingChildCount": 0,
  "tags": ["tag1", "tag2"],
  "due": "2024-01-15T00:00:00.000Z",
  "defer": null,
  "estimatedMinutes": 30,
  "note": "Notes here",
  "added": "2024-01-01T10:00:00.000Z",
  "modified": "2024-01-10T15:30:00.000Z",
  "completionDate": null
}
```

## Troubleshooting

**Permission denied**: Grant automation permission in System Settings > Privacy & Security > Automation.

**Task not found**: Use exact name or ID. IDs appear in JSON output.

**Multiple tasks found**: several tasks share that exact name; the error lists each ID with its
location. Use the ID.

**Refusing to delete**: the task has children or is a project's root task. Pass `--force` to delete
it and everything under it.

**Cannot move under itself**: a task can't be nested under itself or one of its own descendants.

**Date format**: Use ISO format `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`.

## Development

```bash
git clone https://github.com/stephendolan/omnifocus-cli.git
cd omnifocus-cli
bun install
bun run dev     # Watch mode
bun link        # Link globally as `of`
```

## License

MIT
