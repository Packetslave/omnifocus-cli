import { Command } from 'commander';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';
import { OmniFocus } from '../lib/omnifocus.js';
import { parseDateTime } from '../lib/dates.js';
import type { TaskFilters, UpdateTaskOptions } from '../types.js';

export function createTaskCommand(): Command {
  const command = new Command('task');
  command.description('Manage OmniFocus tasks');

  command
    .command('list')
    .alias('ls')
    .description('List tasks')
    .option('-f, --flagged', 'Show only flagged tasks')
    .option('-p, --project <name>', 'Filter by project')
    .option('-t, --tag <name>', 'Filter by tag')
    .option('-c, --completed', 'Include completed tasks')
    .option('--parent <idOrName>', 'List direct children of a task (action group)')
    .action(
      withErrorHandling(async (options) => {
        const of = new OmniFocus();
        const filters: TaskFilters = {
          includeCompleted: options.completed,
          ...(options.flagged && { flagged: true }),
          ...(options.project && { project: options.project }),
          ...(options.tag && { tag: options.tag }),
          ...(options.parent && { parent: options.parent }),
        };
        const tasks = await of.listTasks(filters);
        outputJson(tasks);
      })
    );

  command
    .command('create <name>')
    .description('Create a new task')
    .option('-p, --project <name>', 'Assign to project')
    .option('--parent <idOrName>', 'Nest under a task (action group)')
    .option('--note <text>', 'Add note')
    .option('-t, --tag <tags...>', 'Add tags')
    .option('-d, --due <date>', 'Set due date')
    .option('-D, --defer <date>', 'Set defer date')
    .option('-f, --flagged', 'Flag the task')
    .option('-e, --estimate <minutes>', 'Estimated time in minutes', parseInt)
    .action(
      withErrorHandling(async (name, options) => {
        const of = new OmniFocus();
        const task = await of.createTask({
          name,
          note: options.note,
          project: options.project,
          parent: options.parent,
          tags: options.tag,
          due: options.due ? parseDateTime(options.due) : undefined,
          defer: options.defer ? parseDateTime(options.defer) : undefined,
          flagged: options.flagged,
          estimatedMinutes: options.estimate,
        });
        outputJson(task);
      })
    );

  command
    .command('update <idOrName>')
    .description('Update an existing task')
    .option('-n, --name <name>', 'New name')
    .option('--note <text>', 'New note')
    .option('-p, --project <name>', 'Move to project')
    .option('--parent <idOrName>', 'Move under a task (action group)')
    .option('--no-parent', 'Un-nest: move to the top level of its project or the inbox')
    .option('-t, --tag <tags...>', 'Replace tags')
    .option('-d, --due <date>', 'Set due date')
    .option('-D, --defer <date>', 'Set defer date')
    .option('-f, --flag', 'Flag the task')
    .option('-F, --unflag', 'Unflag the task')
    .option('-c, --complete', 'Mark as completed')
    .option('-C, --incomplete', 'Mark as incomplete')
    .option('--drop', 'Mark as dropped')
    .option('--undrop', 'Restore a dropped task to active')
    .option('-e, --estimate <minutes>', 'Estimated time in minutes', parseInt)
    .action(
      withErrorHandling(async (idOrName, options) => {
        const of = new OmniFocus();
        const updates: UpdateTaskOptions = {
          ...(options.name && { name: options.name }),
          ...(options.note !== undefined && { note: options.note }),
          ...(options.project && { project: options.project }),
          // --parent <x> → string; --no-parent → false (un-nest); neither → undefined
          ...(options.parent !== undefined && { parent: options.parent || null }),
          ...(options.tag && { tags: options.tag }),
          ...(options.due !== undefined && {
            due: options.due ? parseDateTime(options.due) : null,
          }),
          ...(options.defer !== undefined && {
            defer: options.defer ? parseDateTime(options.defer) : null,
          }),
          ...(options.flag && { flagged: true }),
          ...(options.unflag && { flagged: false }),
          ...(options.complete && { completed: true }),
          ...(options.incomplete && { completed: false }),
          ...(options.drop && { dropped: true }),
          ...(options.undrop && { dropped: false }),
          ...(options.estimate !== undefined && { estimatedMinutes: options.estimate }),
        };
        const task = await of.updateTask(idOrName, updates);
        outputJson(task);
      })
    );

  command
    .command('delete <idOrName>')
    .alias('rm')
    .description('Delete a task')
    .option('--force', 'Delete even if the task has children or is a project root task')
    .action(
      withErrorHandling(async (idOrName, options) => {
        const of = new OmniFocus();
        await of.deleteTask(idOrName, { force: options.force });
        outputJson({ message: 'Task deleted successfully' });
      })
    );

  command
    .command('view <idOrName>')
    .description('View task details')
    .action(
      withErrorHandling(async (idOrName) => {
        const of = new OmniFocus();
        const task = await of.getTask(idOrName);
        outputJson(task);
      })
    );

  command
    .command('stats')
    .description('Show task statistics')
    .action(
      withErrorHandling(async () => {
        const of = new OmniFocus();
        const stats = await of.getTaskStats();
        outputJson(stats);
      })
    );

  return command;
}
