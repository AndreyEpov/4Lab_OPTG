
var container;
var camera, scene, renderer;
var cursor3D;
var geometry;
var spotlight = new THREE.PointLight(0xaaff00,8,100,2);
var light = new THREE.DirectionalLight(0xffff00);
var sphere;
var N = 100;  
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var mouse = { x: 0, y: 0 }; //переменная для хранения координат мыши
//массив для объектов, проверяемых на пересечение с курсором
var targetList = []; 

init();
animate();
 
function init()
{
    
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );    
    camera.position.set(N/2, N, N*1.5); 
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));    
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x444444, 1);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;


    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.domElement.addEventListener('mousedown',onDocumentMouseDown,false);
    renderer.domElement.addEventListener('mouseup',onDocumentMouseUp,false);
    renderer.domElement.addEventListener('mousemove',onDocumentMouseMove,false);
    renderer.domElement.addEventListener('wheel',onDocumentMouseScroll,false);
/*
    spotlight.position.set(N*2, N*2, N/2);
    var spotlight.targetObject = new THREE.Object3D();
    targetObject.position.set(N,0,N);
    scene.add(targetObject);

    spotlight.target = targetObject;
    
    spotlight.castShadow = true;

    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;

    spotlight.shadow.camera.near = 500;
    spotlight.shadow.camera.far = 4000;
    spotlight.shadow.camera.fov = 90;
    */
   light.position.set(N, N, N/2 );
    // направление освещения
    light.target = new THREE.Object3D();
    light.target.position.set( 0, 5, 0 );
    scene.add(light.target);
    // включение расчёта теней
    light.castShadow = true;
    // параметры области расчёта теней
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 60, 1, 1, 2500 ) );
    light.shadow.bias = 0.0001;
    // размер карты теней
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    scene.add( light );
    var helper = new THREE.CameraHelper(light.shadow.camera);
    //scene.add(helper);
   
    scene.add(spotlight);
   /* var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
 */ 
CreateTerrain();
addSky();
}
 
 
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
    var delta = clock.getDelta();

    requestAnimationFrame( animate );
    render();
}
function render()
{
    renderer.render( scene, camera );
}
 
function CreateTerrain()
{
    geometry = new THREE.Geometry();
 
    for (var i=0; i < N; i++)
        for (var j=0; j < N; j++)
        {
       
            geometry.vertices.push(new THREE.Vector3( i, 0.0, j));
        }

    for(var i = 0; i < N - 1; i++){
        for(var j = 0; j < N - 1; j++){
            var vertex1 =  i + j * N;
            var vertex2 = (i + 1) + j * N;
            var vertex3 = i + (j + 1) * N;
            var vertex4 = (i + 1) + (j + 1) * N;

            geometry.faces.push(new THREE.Face3(vertex1, vertex2, vertex4));
            geometry.faces.push(new THREE.Face3(vertex1, vertex4, vertex3));

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))
            ]);
        } 
    }
        
    geometry.computeFaceNormals();  
    geometry.computeVertexNormals();

    var loader = new THREE.TextureLoader();
    var tex = loader.load( 'pics/grasstile.jpg' );
        
    var mat = new THREE.MeshLambertMaterial({    
        map: tex,    
        wireframe: false,    
        side: THREE.DoubleSide 
    });
 
    var matMesh = new THREE.Mesh(geometry, mat); 
    matMesh.receiveShadow = true;
    targetList.push(matMesh);
    scene.add(matMesh);
} 
function addSky()
    {
    //создание геометрии сферы
    var geometry = new THREE.SphereGeometry( 300, 32, 32 );
    //загрузка текстуры
    var loader = new THREE.TextureLoader();
    //создание материала
    var material = new THREE.MeshBasicMaterial({
    map: loader.load( "pics/sky-texture.jpg" ),
    side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 50;
    sphere.position.z = 50;
    //sphere.rotation.y = a;
    //размещение объекта в сцене
    scene.add( sphere );
    } 
    function add3DCursor()
    {
        //параметры цилиндра: диаметр вершины, диаметр основания, высота, число сегментов
        var geometry = new THREE.CylinderGeometry( 1.5, 0, 5, 64 );
        var cyMaterial = new THREE.MeshLambertMaterial( {color: 0x888888} );
         cursor3D = new THREE.Mesh( geometry, cyMaterial );
        scene.add(cursor3D ); 
    }
    function onDocumentMouseScroll( event ) 
    {

    }
    function onDocumentMouseMove( event )
    {
        //определение позиции мыши
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

        //создание луча, исходящего из позиции камеры и проходящего сквозь позицию курсора мыши
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        vector.unproject(camera);
        var ray = new THREE.Raycaster( camera.position,vector.sub( camera.position ).normalize() );
        // создание массива для хранения объектов, с которыми пересечётся луч
        var intersects = ray.intersectObjects( targetList );

        // если луч пересёк какой-либо объект из списка targetList
        if ( intersects.length > 0 )
        {
            //печать списка полей объекта
            console.log(intersects[0]);
        }        
    }
    function onDocumentMouseDown( event ) 
    {

    }
    function onDocumentMouseUp( event ) 
    {

    }
