export async function GET() {
  try {
    const response = await fetch('https://interface-gateway.ubeswap.org/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'Stakes',
        variables: {},
        query: ''
      })
    });
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching staking APR:', error);
    return new Response('Error fetching APR', { status: 500 });
  }
} 