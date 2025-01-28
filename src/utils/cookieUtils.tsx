export const setFlowIdCookie = async (flowId: string) => {
    try {
        document.cookie = `flowId=${flowId}; path=/; secure; HttpOnly`;

        // Call the API endpoint to set the flowId cookie with HttpOnly flag
        const response = await fetch('/api/set-flowid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ flowId }),
        });

        if (!response.ok) {
            throw new Error('Failed to set flowId cookie');
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error setting flowId cookie:', error);
    }
};