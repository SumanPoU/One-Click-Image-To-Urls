import ImageUploader from "./_components/image-uploader"


export default function Home() {
  return (
    <main className={`min-h-screen p-6 md:p-12 bg-gradient-to-br from-cyan-500 to-purple-500 `}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 solway-text">Image Uploader</h1>
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <ImageUploader />
        </div>
      </div>
    </main>
  )
}
