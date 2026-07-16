export async function GET(){
    return Response.json({
        data: [
            {
                name: "John",
                age: 20,
            },
            {
                name: "Jane",
                age: 30,
            }
        ]
    })
}
