class AuthProviderHelper {
  private token = "";
  private org?: string;
  private initalized = false;

  public init() {
    this.initalized = true;
  }

  public getToken() {
    if (!this.initalized) {
      throw new Error(
        "You tried to use a Decode Auth resource (eg `wrapFetch`) without having a parent <AuthProvider /> component in the tree. Please wrap your app in <AuthProvider /> near the top of the component tree, like this: <AuthProvider><App /></AuthProvider>."
      );
    }

    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public setOrg(org?: string) {
    this.org = org;
  }

  public goLogin() {
    let orgAppendix = this.org ? `&org=${this.org}` : "";
    window.location.href =
      `https://api.decodeauth.com/auth/start?redirect_url=${window.encodeURIComponent(
        window.location.href
      )}` + orgAppendix;
  }
}

export let authProviderHelper = new AuthProviderHelper();
