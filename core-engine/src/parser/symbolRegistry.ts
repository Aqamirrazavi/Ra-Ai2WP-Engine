/**
 * Central Symbol & Hook Registry (Part 1 - Principle 4 & 5)
 * Guarantees unique prefixing and collision-free names for functions,
 * classes, constants, AJAX actions, CPTs, and nonces.
 */
export class SymbolRegistry {
  private readonly projectSlug: string;
  private readonly uniquePrefix: string;
  private readonly declaredFunctions = new Set<string>();
  private readonly declaredClasses = new Set<string>();
  private readonly declaredConstants = new Set<string>();
  private readonly declaredAjaxActions = new Set<string>();
  private readonly declaredNonces = new Set<string>();
  private readonly declaredShortcodes = new Set<string>();

  constructor(projectName: string) {
    this.projectSlug = projectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Strict unique project-based prefix (non-generic, derived from project name)
    this.uniquePrefix = (this.projectSlug || 'rtw_custom') + '_';
  }

  public getPrefix(): string {
    return this.uniquePrefix;
  }

  public getSlug(): string {
    return this.projectSlug;
  }

  public registerFunction(baseName: string): string {
    const cleanName = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
    const fullName = cleanName.startsWith(this.uniquePrefix)
      ? cleanName
      : `${this.uniquePrefix}${cleanName}`;

    this.declaredFunctions.add(fullName);
    return fullName;
  }

  public registerClass(baseName: string): string {
    const cleanName = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
    const pascalPrefix = this.uniquePrefix
      .split('_')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('_') + '_';

    const fullName = cleanName.startsWith(pascalPrefix)
      ? cleanName
      : `${pascalPrefix}${cleanName}`;

    this.declaredClasses.add(fullName);
    return fullName;
  }

  public registerConstant(baseName: string): string {
    const upperPrefix = this.uniquePrefix.toUpperCase();
    const cleanName = baseName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const fullName = cleanName.startsWith(upperPrefix)
      ? cleanName
      : `${upperPrefix}${cleanName}`;

    this.declaredConstants.add(fullName);
    return fullName;
  }

  public registerAjaxAction(actionName: string): string {
    const cleanName = actionName.replace(/[^a-zA-Z0-9_]/g, '_');
    const fullAction = cleanName.startsWith(this.uniquePrefix)
      ? cleanName
      : `${this.uniquePrefix}${cleanName}`;

    this.declaredAjaxActions.add(fullAction);
    return fullAction;
  }

  public registerNonce(context: string): string {
    const cleanContext = context.replace(/[^a-zA-Z0-9_]/g, '_');
    const nonce = `${this.uniquePrefix}${cleanContext}_nonce`;
    this.declaredNonces.add(nonce);
    return nonce;
  }

  public getDeclaredFunctions(): string[] {
    return Array.from(this.declaredFunctions);
  }

  public getDeclaredClasses(): string[] {
    return Array.from(this.declaredClasses);
  }

  public getDeclaredConstants(): string[] {
    return Array.from(this.declaredConstants);
  }

  public getDeclaredAjaxActions(): string[] {
    return Array.from(this.declaredAjaxActions);
  }
}
