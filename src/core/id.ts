let counter = 0;

/** Generate a process-unique id for newly created events. */
export function genId(prefix = "bc"): string {
  counter += 1;
  const rand = Math.floor(Math.random() * 1e6).toString(36);
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}${rand}`;
}
