const getEnvVariables = () => {
    
    const organizationName = process.env.NEXT_PUBLIC_ORGANIZATION_NAME;
    const scope = process.env.NEXT_PUBLIC_SCOPE;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

    if (!organizationName || !scope || !clientId || !redirectUri) {
        throw new Error("Missing required environment variables");
    }

    return {
        organizationName,
        scope,
        redirectUri,
        clientId,
    };
};

export const basicAuthentication = async (flowId: string, email: string, password: string) => {

    const authnUrl = `https://api.asgardeo.io/t/${process.env.NEXT_PUBLIC_ORGANIZATION_NAME}/oauth2/authn`;
    const requestBody = {
        flowId,
        selectedAuthenticator: {
            authenticatorId: process.env.NEXT_PUBLIC_BASIC_AUTHENTICATOR_ID, // Username & Password authenticator ID
            params: {
                username: email,
                password: password,
            },
        },
    };

    try {
        const response = await fetch(authnUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Authentication request failed:", error);
        throw new Error('Authentication request failed');
    }
};

export const initRequest = async () => {

    const { organizationName, scope, redirectUri, clientId } = getEnvVariables();

    // Construct the OAuth2 authorization URL
    const authUrl = `https://api.asgardeo.io/t/${organizationName}/oauth2/authorize?` +
        `scope=${encodeURIComponent(scope || '')}&` +
        `redirect_uri=${encodeURIComponent(redirectUri || '')}&` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(clientId || '')}&` +
        `response_mode=direct`;

    try {
        // Step 1: Get the authorization code from the initial OAuth2 authorization request
        const authorizeResponse = await fetch(authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
        });

        const authorizeResponseData = await authorizeResponse.json();
        return authorizeResponseData;
    } catch (error) {
        console.error("Authorization request failed:", error);
        throw new Error('Authorization request failed');
    }
};

export const fetchOAuth2Token = async (organization_name: string, client_id: string, authCode: string, redirect_uri: string) => {
    const tokenUrl = `https://api.asgardeo.io/t/${organization_name}/oauth2/token`;
    const tokenRequestBody = new URLSearchParams({
      client_id: client_id,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: redirect_uri,
    });
  
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenRequestBody.toString(),
      });
  
      const tokenData = await tokenResponse.json();
  
      if (tokenData.id_token) {
        // Decode the ID token (JWT) to retrieve user details
        const decodedToken = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString());
  
        // Assuming the decoded JWT contains these fields
        return {
          id: decodedToken.sub,
          name: decodedToken.name,
          email: decodedToken.email,
          given_name: decodedToken.given_name,
          family_name: decodedToken.family_name,
          id_token: tokenData.id_token, // Store the ID token for later use
        };
      }
      return null; // Flow incomplete or failed
    } catch (error) {
      console.error("OAuth2 Authorization failed:", error);
      throw new Error('OAuth2 Authorization failed');
    }
  };