import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        {/* Google Fonts */}
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />
        {/* Vendor CSS Files */}
        <link href="/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
        <link href="/boxicons/css/boxicons.min.css" rel="stylesheet" />
        <link href="/quill/quill.snow.css" rel="stylesheet" />
        <link href="/quill/quill.bubble.css" rel="stylesheet" />
        <link href="/remixicon/remixicon.css" rel="stylesheet" />
        <link href="/simple-datatables/style.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
