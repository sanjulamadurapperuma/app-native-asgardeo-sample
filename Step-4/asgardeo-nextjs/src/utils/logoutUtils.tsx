export const logoutFromAsgardeo = async (idToken: string) => {
    const organization_name = process.env.NEXT_PUBLIC_ORGANIZATION_NAME;
    const logoutUrl = `https://api.asgardeo.io/t/${organization_name}/oidc/logout`;
  
    try {
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          id_token_hint: idToken,
          response_mode: 'direct',
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to log out from Asgardeo');
      }
  
      console.log("Successfully logged out from Asgardeo");
    } catch (error) {
      console.error("Logout request failed:", error);
      throw new Error('Logout request failed');
    }
  };