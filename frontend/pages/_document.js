import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts */}
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />

        {/* Vendor CSS Files */}
        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link
          href="/assets/bootstrap-icons/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/assets/boxicons/css/boxicons.min.css" rel="stylesheet" />
        <link href="/assets/quill/quill.snow.css" rel="stylesheet" />
        <link href="/assets/quill/quill.bubble.css" rel="stylesheet" />
        <link href="/assets/remixicon/remixicon.css" rel="stylesheet" />
        <link href="/assets/simple-datatables/style.css" rel="stylesheet" />

        {/* Template Main CSS File */}
        <link href="/assets/css/style.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
