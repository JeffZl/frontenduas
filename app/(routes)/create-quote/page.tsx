"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const page = () => {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [fileData, setFileData] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      setFileData(file)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !fileData) {
      setErrorMsg("Please type something or upload an image.")
      return
    }

    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      let media: any = []
      if (fileData) {
        const base64 = await toBase64(fileData)
        const type = fileData.type.startsWith("video") ? "video" : "image"
        media = [{ base64, type }]
      }

      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          media,
          hashtags: content.match(/#[\w]+/g) || [],
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to post quote")

      setSuccessMsg("Quote posted successfully!")
      setContent("")
      setPreview(null)
      setFileData(null)

      setTimeout(() => router.push("/"), 1500)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  return (
    <main className="p-5 overflow-y-auto min-h-screen text-white bg-black">
      <h1 className="text-2xl font-bold">Create Quote</h1>

      <div className="flex flex-col gap-4 border border-gray-800 rounded-2xl p-5 mt-5">
        <textarea
          id="quote-text"
          placeholder="Write your quote..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent border-none resize-none text-base text-white outline-none min-h-[100px] placeholder-gray-400"
        />

        <div className="flex items-center gap-3">
          <label
            htmlFor="image-upload"
            className="flex items-center gap-2 bg-[#1d9bf0] hover:bg-[#0d8ae8] text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition"
          >
            <Image src="/icons/image.svg" alt="Upload" width={20} height={20} />
            Upload Image
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {preview && (
          <div id="image-preview">
            <Image
              src={preview}
              alt="Preview"
              width={600}
              height={400}
              className="w-full rounded-xl mt-3 object-cover"
            />
          </div>
        )}

        {errorMsg && (
          <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-green-500 text-sm font-medium">{successMsg}</p>
        )}

        <button
          id="post-btn"
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-2 bg-white text-black font-bold py-3 rounded-full transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
        >
          {loading ? "Posting..." : "Post Quote"}
        </button>
      </div>
    </main>
  )
}

export default page
