import Head from 'next/head'
import MainMenu from '../components/Mainmeun'

export default function Home() {
  return (
    <div>
      <Head>
        <title>(주)명윤철강</title>
        <meta name="description" content="Next.js로 만든 E4SSC 웹앱" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>(주)명윤철강 ERP for Coil Service Center [개발팀]</h1>
        <MainMenu />
      </main>
    </div>
  )
  
}
