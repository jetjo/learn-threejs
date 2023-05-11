// import "//unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"

import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader';
import { CSS3DSprite, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer';

let root;
let baseSprite;

const VIZ_TYPE = {
    'Atoms': 0,
    'Bonds': 1,
    'Atoms + Bonds': 2
};


const params = {
    vizType: 2,
    molecule: 'caffeine.pdb'
};

const objects = [];
function changeVizType ( vizType )
{
    function getShowFlag ( is )
    {
        if ( vizType === VIZ_TYPE.Atoms ) return is;
        else if ( vizType === VIZ_TYPE.Bonds ) return !is;
        else if ( vizType === VIZ_TYPE[ 'Atoms + Bonds' ] ) return true;
        else throw Error( 'Unknown vizType' );
    }
    function setHeight ( object )
    {
        if ( vizType === VIZ_TYPE.Bonds )
        {// if ( !object instanceof CSS3DSprite )
            object.element.style.height = object.userData.bondLengthFull;
        }
        else if ( vizType === VIZ_TYPE[ 'Atoms + Bonds' ] )
        {// if ( !object instanceof CSS3DSprite )
            object.element.style.height = object.userData.bondLengthShort;
        }
    }

    objects.forEach( ( object ) =>
    {
        const is = object instanceof CSS3DSprite;
        if ( getShowFlag( is ) )
        {
            object.element.style.display = '';
            !is && setHeight( object );
            object.visible = true;
        }
        else
        {
            object.element.style.display = 'none';
            object.visible = false;
        }
    } );
}


function colorify ( ctx, width, height, color )
{

    const r = color.r, g = color.g, b = color.b;

    const imageData = ctx.getImageData( 0, 0, width, height );
    const data = imageData.data;

    for ( let i = 0, l = data.length; i < l; i += 4 )
    {

        data[ i + 0 ] *= r;
        data[ i + 1 ] *= g;
        data[ i + 2 ] *= b;

    }

    ctx.putImageData( imageData, 0, 0 );

}

function imageToCanvas ( image )
{

    const width = image.width;
    const height = image.height;

    const canvas = document.createElement( 'canvas' );

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0, width, height );

    return canvas;

}

const loader = new PDBLoader();
const colorSpriteMap = {};


const tmpVec1 = new THREE.Vector3();
const tmpVec2 = new THREE.Vector3();
const tmpVec3 = new THREE.Vector3();
const tmpVec4 = new THREE.Vector3();
const offset = new THREE.Vector3();

function createDataUrl ( color )
{
    const canvas = imageToCanvas( baseSprite );
    const context = canvas.getContext( '2d' );

    colorify( context, canvas.width, canvas.height, color );

    const dataUrl = canvas.toDataURL();
    return dataUrl;
}

function createCSS3dSprite ( element, position )
{
    const colorSprite = colorSpriteMap[ element ];

    const atom = document.createElement( 'img' );
    atom.src = colorSprite;

    const object = new CSS3DSprite( atom );
    object.position.copy( position );
    object.position.multiplyScalar( 75 );

    object.matrixAutoUpdate = false;
    object.updateMatrix();
    return object;
}

function setupEachAtom ( { pos, color, _pos, _color, json, i } )
{
    _pos.fromBufferAttribute( pos, i );
    _color.fromBufferAttribute( color, i );

    const atomJSON = json.atoms[ i ];
    const ele = atomJSON[ 4 ]
    if ( !colorSpriteMap[ ele ] )
    {
        colorSpriteMap[ ele ] = createDataUrl( _color );
    }

    const object = createCSS3dSprite( ele, _pos );
    root.add( object );
    objects.push( object );
}

function pdbAtomLoader ( geometry, json )
{
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter( offset ).negate();
    const { x, y, z } = offset;
    geometry.translate( x, y, z );
    
    const pos = geometry.getAttribute( 'position' );
    const color = geometry.getAttribute( 'color' );

    const _pos = new THREE.Vector3();
    const _color = new THREE.Color();

    for ( let i = 0; i < pos.count; i++ )
    {
        setupEachAtom( { pos, color, _pos, _color, json, i } );
    }
}

function pdbBoundLoader ( geometryBonds )
{
    const { x, y, z } = offset;
    geometryBonds.translate( x, y, z );

    const positionBonds = geometryBonds.getAttribute( 'position' );

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();

    for ( let i = 0; i < positionBonds.count; i += 2 )
    {

        start.fromBufferAttribute( positionBonds, i );
        end.fromBufferAttribute( positionBonds, i + 1 );

        start.multiplyScalar( 75 );
        end.multiplyScalar( 75 );

        tmpVec1.subVectors( end, start );
        const bondLength = tmpVec1.length() - 50;

        //

        let bond = document.createElement( 'div' );
        bond.className = 'bond';
        bond.style.height = bondLength + 'px';

        let object = new CSS3DObject( bond );
        object.position.copy( start );
        object.position.lerp( end, 0.5 );

        object.userData.bondLengthShort = bondLength + 'px';
        object.userData.bondLengthFull = ( bondLength + 55 ) + 'px';

        //

        const axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
        const radians = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );

        const objMatrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );
        object.matrix.copy( objMatrix );
        object.quaternion.setFromRotationMatrix( object.matrix );

        object.matrixAutoUpdate = false;
        object.updateMatrix();

        root.add( object );

        objects.push( object );

        //

        const joint = new THREE.Object3D();
        joint.position.copy( start );
        joint.position.lerp( end, 0.5 );

        joint.matrix.copy( objMatrix );
        joint.quaternion.setFromRotationMatrix( joint.matrix );

        joint.matrixAutoUpdate = false;
        joint.updateMatrix();

        bond = document.createElement( 'div' );
        bond.className = 'bond';
        bond.style.height = bondLength + 'px';

        object = new CSS3DObject( bond );
        object.rotation.y = Math.PI / 2;

        object.matrixAutoUpdate = false;
        object.updateMatrix();

        object.userData.bondLengthShort = bondLength + 'px';
        object.userData.bondLengthFull = ( bondLength + 55 ) + 'px';

        object.userData.joint = joint;

        joint.add( object );
        root.add( joint );

        objects.push( object );

    }

}

function pdbLoader ( pdb )
{
    const { geometryAtoms, geometryBonds, json } = pdb
    pdbAtomLoader( geometryAtoms, json );
    pdbBoundLoader( geometryBonds );
    //console.log( "CSS3DObjects:", objects.length );

    changeVizType( params.vizType );
}

const modelBaseUrl = 'models/pdb/';

function loadMolecule ( model )
{
    const url = modelBaseUrl + model;

    for ( let i = 0; i < objects.length; i++ )
    {
        const object = objects[ i ];
        object.parent.remove( object );
    }

    objects.length = 0;

    loader.load( url, pdbLoader );
}

function setUp ( _baseSprite, _root )
{
    baseSprite = _baseSprite;
    root = _root;
}

export { setUp, changeVizType }

export default loadMolecule
