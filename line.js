import * as THREE from 'three'

function setCamera ( camera )
{
    camera.position.set( 0, 0, 100 )
    camera.lookAt( 0, 0, 0 );
}

function createBasicLine ()
{
    const config = {
        material: { color: 0x0000ff },
        geometry: {
            vector3s: [
                [ -10, 0, 0 ],
                [ 0, 10, 0 ],
                [ 10, 0, 0 ]
            ]
        }
    }
    const material = new THREE.LineBasicMaterial( config.material );

    const points = config.geometry.vector3s.map( vector3 => new THREE.Vector3( ...vector3 ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    const line = new THREE.Line( geometry, material );

    return line;
}

export { setCamera, createBasicLine }
