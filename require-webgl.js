import WebGL from 'three/addons/capabilities/WebGL'

function requireWebGL ()
{
    if ( !WebGL.isWebGLAvailable() )
    {
        const warning = WebGL.getWebGLErrorMessage();
        throw Error( warning );
    }
}

export default requireWebGL