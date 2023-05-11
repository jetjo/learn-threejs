// import "//unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls'
import { GUI } from '../jsm/libs/lil-gui.module.min'
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer';
import loadMolecule, {setUp, changeVizType} from './molecule-loader';

let camera;
let scene;
let root;
let renderer;
let controls;
let baseSprite;

const VIZ_TYPE = {
    'Atoms': 0,
    'Bonds': 1,
    'Atoms + Bonds': 2
};

const MOLECULES = {
    'Ethanol': 'ethanol.pdb',
    'Aspirin': 'aspirin.pdb',
    'Caffeine': 'caffeine.pdb',
    'Nicotine': 'nicotine.pdb',
    'LSD': 'lsd.pdb',
    'Cocaine': 'cocaine.pdb',
    'Cholesterol': 'cholesterol.pdb',
    'Lycopene': 'lycopene.pdb',
    'Glucose': 'glucose.pdb',
    'Aluminium oxide': 'Al2O3.pdb',
    'Cubane': 'cubane.pdb',
    'Copper': 'cu.pdb',
    'Fluorite': 'caf2.pdb',
    'Salt': 'nacl.pdb',
    'YBCO superconductor': 'ybco.pdb',
    'Buckyball': 'buckyball.pdb',
    // 'Diamond': 'diamond.pdb',
    'Graphite': 'graphite.pdb'
};

const params = {
    vizType: 2,
    molecule: 'caffeine.pdb'
};

function init ( $eleId = 'container' )
{
    setupCamera( {} );
    setupScene();
    setup3dObj();
    setupRenderer( $eleId );
    setupControls();
    setupSprite();
    setupWindowResizeHandler();
    setupGUI();
}

function setupCamera ( { fov = 70, w, h, near = 1, far = 5000 }, pos = { x: 0, y: 0, z: 1000 } )
{
    camera = new THREE.PerspectiveCamera( fov, ( !w || !h ) ? ( window.innerWidth / window.innerHeight ) : ( w / h ), near, far );
    // NOTE: position is readonly!!!
    camera.position.x = pos.x;
    camera.position.y = pos.y;
    camera.position.z = pos.z;
}

function setupScene ()
{
    scene = new THREE.Scene();
}

function setup3dObj ()
{
    root = new THREE.Object3D();
    scene.add( root );
}

function setupRenderer ( $eleId, w, h )
{
    renderer = new CSS3DRenderer();
    renderer.setSize( w || window.innerWidth, h || window.innerHeight );
    document.getElementById( $eleId ).appendChild( renderer.domElement );
}

function setupControls ( rotateSpeed = .5 )
{
    controls = new TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = rotateSpeed;
}

function setupSprite ( src = 'textures/sprites/ball.png' )
{
    baseSprite = document.createElement( 'img' );
    baseSprite.addEventListener( 'load', () =>
    {
        loadMolecule( params.molecule );
    } )
    baseSprite.src = src;
}

function setupWindowResizeHandler ()
{
    window.addEventListener( 'resize', onWindowResize, false );
}

function setupGUI ()
{
    const gui = new GUI();
    gui.add( params, 'vizType', VIZ_TYPE ).onChange( changeVizType );
    gui.add( params, 'molecule', MOLECULES ).onChange( loadMolecule );
    gui.open();
}

function onWindowResize ()
{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate ()
{

    requestAnimationFrame( animate );
    controls.update();

    const time = Date.now() * 0.0004;

    root.rotation.x = time;
    root.rotation.y = time * 0.7;

    render();

}

function render ()
{

    renderer.render( scene, camera );

}


init();
setUp( baseSprite, root );
animate();

