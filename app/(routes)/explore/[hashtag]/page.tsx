const Page = async ({ params }: { params : { hashtag: string }}) => {
    const { hashtag } = await params
    return (
        <div>{hashtag}</div>
    )
}
export default Page