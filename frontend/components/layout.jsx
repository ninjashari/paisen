import Head from "next/head"

const Layout = ({ titleName }) => {
  return (
    <Head>
      <title>{titleName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  )
}

export default Layout
