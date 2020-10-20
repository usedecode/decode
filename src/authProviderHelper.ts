class AuthProviderHelper {
  private token = "";
  private org?: string;

  public getToken() {
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
