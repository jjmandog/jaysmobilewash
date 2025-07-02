import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Mobile Detailing Los Angeles & Orange County | Jay&apos;s Mobile Wash - #1 Car Detailing Service</title>
        <meta name="description" content="★★★★★ Premium mobile car detailing in Los Angeles & Orange County. Ceramic coating, paint correction, interior detailing. We come to you! Call 562-228-9429" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: `
        <script>
          // Redirect to the original index.html for now
          window.location.href = '/index.html';
        </script>
      ` }} />
    </>
  )
}