import { describe, it, expect } from 'vitest';
import { OmniFocus } from '../omnifocus.js';

/**
 * The Omni Automation scripts are built as strings and only run inside
 * OmniFocus, so these tests capture the generated script instead of
 * executing it and assert on the hierarchy-related branches.
 */
function capture() {
  const of = new OmniFocus();
  const scripts: string[] = [];
  (of as unknown as { executeJXA: (s: string) => Promise<string> }).executeJXA = async (s) => {
    scripts.push(s);
    return '{}';
  };
  return { of, scripts };
}

describe('task hierarchy scripts', () => {
  it('lists the children of a parent task', async () => {
    const { of, scripts } = capture();
    await of.listTasks({ parent: 'Work' });
    expect(scripts[0]).toContain('findTask(\\"Work\\").children');
  });

  it('creates a task under a parent', async () => {
    const { of, scripts } = capture();
    await of.createTask({ name: 'child', parent: 'Work' });
    expect(scripts[0]).toContain('new Task(\\"child\\", parentTask.ending)');
  });

  it('rejects creating with both project and parent', async () => {
    const { of } = capture();
    await expect(of.createTask({ name: 'n', project: 'p', parent: 'q' })).rejects.toThrow('not both');
  });

  it('moves a task under a parent, guarding against cycles', async () => {
    const { of, scripts } = capture();
    await of.updateTask('x', { parent: 'y' });
    expect(scripts[0]).toContain('moveTasks([task], parentTask.ending)');
    expect(scripts[0]).toContain('under itself or its own descendant');
  });

  it('un-nests a task when parent is null', async () => {
    const { of, scripts } = capture();
    await of.updateTask('x', { parent: null });
    expect(scripts[0]).toContain('inbox.ending');
    expect(scripts[0]).not.toContain('parentTask');
  });

  it('rejects updating with both project and parent', async () => {
    const { of } = capture();
    await expect(of.updateTask('x', { project: 'p', parent: 'q' })).rejects.toThrow('not both');
  });

  it('guards delete unless forced', async () => {
    const { of, scripts } = capture();
    await of.deleteTask('x');
    expect(scripts[0]).toContain('Refusing to delete');
    await of.deleteTask('x', { force: true });
    expect(scripts[1]).not.toContain('Refusing to delete');
    expect(scripts[1]).toContain('deleteObject(task)');
  });

  it('lists top-level inbox items by default and descendants with includeChildren', async () => {
    const { of, scripts } = capture();
    await of.listInboxTasks();
    expect(scripts[0]).not.toContain('flattenedChildren');
    await of.listInboxTasks({ includeChildren: true });
    expect(scripts[1]).toContain('flattenedChildren');
  });
});
