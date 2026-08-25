export function db(env) {
  const binding = env.xiaoxiaoxingci ?? env.DB;
  if (!binding) {
    throw new Error('D1 binding xiaoxiaoxingci is missing');
  }
  return binding;
}
