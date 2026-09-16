// Node ESM resolve hook for the unit gates: the app's modules import each
// other extensionless (`./dates`, `./fixtures`) the way Vite resolves them,
// which plain Node cannot. Registered by tests that load real app modules.
export async function resolve(specifier, context, nextResolve) {
  const local = specifier.startsWith('./') || specifier.startsWith('../')
  const extensionless = !/\.[a-z]+$/i.test(specifier)
  if (local && extensionless && /\/src\/field-notebook\//.test(context.parentURL || '')) {
    return nextResolve(specifier + '.js', context)
  }
  return nextResolve(specifier, context)
}
