import type { NextPage } from 'next'
import { RedocStandalone } from 'redoc';
import __html from 'docs/dist/openapi.html'
import spec from 'docs/dist/openapi.json'

const Home: NextPage = () => {
  if(process.browser) {
    return <RedocStandalone spec={spec}/>
  } else {
    return <div dangerouslySetInnerHTML={{__html }}></div>
  }
}

export default Home
