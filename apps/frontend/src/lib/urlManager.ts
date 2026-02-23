export class URLManager {
  private urlObj: URL;

  constructor(url?: string) {
    this.urlObj = new URL(url || window.location.href);
  }

  /**
   * Removes all query parameters from the URL.
   * @returns The URLManager instance for chaining.
   */
  clearSearch(): this {
    this.urlObj.search = '';
    return this;
  }

  /**
   * Adds or updates query parameters in the URL.
   * @param params - An object containing key-value pairs to be added as query parameters.
   * @returns The URLManager instance for chaining.
   */
  addSearchParams(params: Record<string, string>): this {
    Object.keys(params).forEach((key) => {
      this.urlObj.searchParams.set(key, params[key]);
    });
    return this;
  }

  /**
   * Sets query parameters, replacing any existing ones.
   * @param params - An object containing key-value pairs to set as query parameters.
   * @returns The URLManager instance for chaining.
   */
  setSearchParams(
    params:
      | { [key: string]: string | number | boolean | undefined }
      | Record<string, string | number | boolean | undefined>,
  ): this {
    this.urlObj.search = '';
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        this.urlObj.searchParams.set(key, value.toString());
    });
    return this;
  }

  setSearchParam(key: string, value: string): this {
    this.urlObj.searchParams.set(key, value);
    return this;
  }

  /**
   * Removes a specific query parameter from the URL.
   * @param key - The name of the query parameter to remove.
   * @returns The URLManager instance for chaining.
   */
  removeParam(key: string): this {
    this.urlObj.searchParams.delete(key);
    return this;
  }

  /**
   * Opens the URL in the current window.
   */
  openUrl(): void {
    window.location.href = this.urlObj.toString();
  }

  /**
   * Opens the URL in a new tab.
   */
  openNewTab(): void {
    window.open(this.urlObj.toString(), '_blank');
  }

  /**
   * Returns the full URL as a string.
   */
  toString(): string {
    return this.urlObj.toString();
  }

  /**
   * Retrieves the value of a specific query parameter.
   * @param key - The name of the query parameter.
   * @returns The value of the query parameter or null if not found.
   */
  getSearchParam(key: string): string | null {
    return this.urlObj.searchParams.get(key);
  }

  /**
   * Returns all query parameters as an object.
   */
  getSearchParams(): Record<string, string> {
    const params: Record<string, string> = {};
    this.urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Returns the hostname of the URL.
   */
  getHostname(): string {
    return this.urlObj.hostname;
  }

  removePath(): this {
    this.urlObj.pathname = '/';
    this.urlObj.search = '';
    this.urlObj.hash = '';
    return this;
  }

  /**
   * Sets the path of the URL.
   * @param path - The new path to set.
   * @returns The URLManager instance for chaining.
   */
  setPath(path: string): this {
    this.urlObj.pathname = path;
    return this;
  }

  getPath(): string {
    return this.urlObj.pathname;
  }

  /**
   * Returns the relative URL (path + search + hash).
   * @returns The relative URL as a string.
   */
  getRelativeUrl(): string {
    return this.urlObj.pathname + this.urlObj.search + this.urlObj.hash;
  }
}
