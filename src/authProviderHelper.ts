class AuthProviderHelper {
  private token: string | undefined;
  private initalized = false;

  public init() {
    this.initalized = true;
  }


  public __internal_getToken() {
    return this.token;
  }

  public getToken() {
    if (!this.initalized) {
      throw new Error(
        "You tried to use a Decode Auth resource (eg `wrapFetch`) without having a parent <AuthProvider /> component in the tree. Please wrap your app in <AuthProvider /> near the top of the component tree, like this: <AuthProvider><App /></AuthProvider>."
      );
    }

    return this.token;
  }

  public setToken(token?: string) {
    this.token = token;
  }
}

export let authProviderHelper = new AuthProviderHelper();
