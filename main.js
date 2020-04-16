
var container;
var camera, scene, renderer;
var cursor3D;
var geometry;
var spotlight = new THREE.PointLight(0xaaff00,8,100,2);
var light = new THREE.DirectionalLight(0xffffff);
var sphere;
var N = 100;  
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var mouse = { x: 0, y: 0 }; //переменная для хранения координат мыши
//массив для объектов, проверяемых на пересечение с курсором
var targetList = []; 
var circle;
var radius=1;
var brushDirection=0;
//объект интерфейса и его ширина
var gui = new dat.GUI();
gui.width = 200;

var targetList=[];
var objectList=[];

var brVis = false;

var models= new Map();

var selected = null;

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
    renderer.domElement.addEventListener("contextmenu",
                                                        function (event)
                                                            {
                                                                event.preventDefault();
                                                            });
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
add3DCursor();
addCirkle();
circle.scale.set(radius,1,radius);
GUI();

loadModel('models/house/', "Cyprys_House.obj", "Cyprys_House.mtl",1,'house');
loadModel('models/grade/', "grade.obj", "grade.mtl",1,'grade');
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
    if (brushDirection!=0)
    {
        sphereBrush(brushDirection,delta);
    }
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
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    // Повторить текстуру 10х10 раз
    tex.repeat.set( 4,4 );
        
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
function addCirkle()
    {
        var material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
  
        var segments = 64;
        var circleGeometry = new THREE.CircleGeometry( radius, segments );
        //удаление центральной вершины
        circleGeometry.vertices.shift();

        for(var i=0;i<circleGeometry.vertices.length;i++)
        {
            circleGeometry.vertices[i].z=circleGeometry.vertices[i].y;
            circleGeometry.vertices[i].y=0;
        }

        circle = new THREE.Line( circleGeometry, material );
        circle.scale.set(radius,1,radius);
        circle.visible = false;
        scene.add( circle ); 
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
        var cyMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
         cursor3D = new THREE.Mesh( geometry, cyMaterial );
         cursor3D.visible = false;
         
        scene.add(cursor3D ); 
    }
    function onDocumentMouseScroll( event ) 
    {
        if (brVis==true)
            {   
            if (radius>1)
                if(event.wheelDelta<0)
                radius--;
            if (radius<40)
                if (event.wheelDelta>0)
                radius++;

            circle.scale.set(radius,1,radius);
            }
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

        if (brVis==true)
        {
            if ( intersects.length > 0 )
            {
                //печать списка полей объекта
            // console.log(intersects[0]);
                if(cursor3D!=null)
                {
                cursor3D.position.copy(intersects[0].point);
                cursor3D.position.y+=2.5;
                }
                if(circle!=null)
                {
                    circle.position.copy(intersects[0].point);
                // circle.rotation.x = Math.PI/2;
                    circle.position.y=0;
                    for (var i = 0; i < circle.geometry.vertices.length; i++)
                    {
                        //получение позиции в локальной системе координат
                        var pos = new THREE.Vector3();
                        pos.copy(circle.geometry.vertices[i]);
                        //нахождение позиции в глобальной системе координат
                        pos.applyMatrix4(circle.matrixWorld);

                        var x = Math.round(pos.x);
                        var z = Math.round(pos.z);

                        if(x>=0&&x<N&&z>=0&&z<N)
                        {
                        var y = geometry.vertices[z+x*N].y;
                        circle.geometry.vertices[i].y = y+0.03;
                        } else circle.geometry.vertices[i].y = 0;
                    }
                    circle.geometry.verticesNeedUpdate = true;
                }
               
            }
        }  
        else
        {
            if ( intersects.length > 0 )
            {
                if(selected!=null)
                    selected.position.copy(intersects[0].point);

            }
        }      
    }
    function onDocumentMouseDown( event ) 
    {
        if (brVis==true)
        {
            //console.log(event.which);
            if (event.which == 1)
                brushDirection = 1;
            if (event.which == 3)
                brushDirection=-1;
        }else
        {
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
            
            //создание луча, исходящего из позиции камеры и проходящего сквозь позицию курсора мыши
            var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
            vector.unproject(camera);
            var ray = new THREE.Raycaster( camera.position,vector.sub( camera.position ).normalize() );
            var intersects = ray.intersectObjects( objectList ,true);
            if (intersects.length>0)
            {
                selected = intersects[0].object.parent;
            }
        }
   }
    function onDocumentMouseUp( event ) 
    {
        if(brVis==true)
        {
            brushDirection=0;
        }else
        {
            selected = null;
        }
    }
    function sphereBrush(dir,delta)
    {
        for(var i = 0; i < geometry.vertices.length;i++)
        {
            var x2 = geometry.vertices[i].x;
            var z2 = geometry.vertices[i].z;
            var r = radius;
            var x1 = cursor3D.position.x;
            var z1 = cursor3D.position.z;

            //ℎ = √𝑟2 − ((𝑥2 − 𝑥1)2 + (𝑧2 − 𝑧1)2)

            var h = r*r - (((x2-x1)*(x2-x1)+((z2-z1)*(z2-z1))));
            if (h>0)
            {
                geometry.vertices[i].y+=Math.sqrt(h)*delta*dir;
            }

        
        }
        geometry.computeFaceNormals();
        geometry.computeVertexNormals(); //пересчёт нормалей
        geometry.verticesNeedUpdate = true; //обновление вершин
        geometry.normalsNeedUpdate = true; //обновление нормалей

    }
function GUI()
    {
        //массив переменных, ассоциированных с интерфейсом
    var params =
    {
        sx: 0, sy: 0, sz: 0,
        brush: false,
        addHouse: function() { addMesh('house') },
        addGrade: function() { addMesh('grade') }
      //  del: function() { delMesh() }
    };
    //создание вкладки
    var folder1 = gui.addFolder('Scale');
    //ассоциирование переменных отвечающих за масштабирование
    //в окне интерфейса они будут представлены в виде слайдера
    //минимальное значение - 1, максимальное – 100, шаг – 1
    //listen означает, что изменение переменных будет отслеживаться
    var meshSX = folder1.add( params, 'sx' ).min(1).max(100).step(1).listen();
    var meshSY = folder1.add( params, 'sy' ).min(1).max(100).step(1).listen();
    var meshSZ = folder1.add( params, 'sz' ).min(1).max(100).step(1).listen();
    //при запуске программы папка будет открыта
    folder1.open();
    //описание действий совершаемых при изменении ассоциированных значений
   /* meshSX.onChange(function(value) {…});
    meshSY.onChange(function(value) {…});
    meshSZ.onChange(function(value) {…});
    *///добавление чек бокса с именем brush
    var cubeVisible = gui.add( params, 'brush' ).name('brush').listen();
    cubeVisible.onChange(function(value)
    {
        brVis = value;
        cursor3D.visible = value;
        circle.visible = value;
    });
    //добавление кнопок, при нажатии которых будут вызываться функции addMesh
    //и delMesh соответственно. Функции описываются самостоятельно.
    gui.add( params, 'addHouse' ).name( "add house" );
    gui.add( params, 'addGrade' ).name( "add grade" );
   // gui.add( params, 'del' ).name( "delete" );

    //при запуске программы интерфейс будет раскрыт
    gui.open();
    }

    function loadModel(path, oname, mname,s,name)
{
    // функция, выполняемая в процессе загрузки модели (выводит процент загрузки)
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var onError = function ( xhr ) { };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( path );
        // функция загрузки материала
    mtlLoader.load( mname, function( materials )
        {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( path );
       

            // функция загрузки модели
            objLoader.load( oname, function ( object )
            {
               

                object.castShadow = true;
                object.traverse( function ( child )
                    {
                        if ( child instanceof THREE.Mesh )
                            {
                                 child.castShadow = true;
                                 child.parent = object;
                            }
                    } );
                    object.parent = object;
               
                    var x = Math.random()*N;
                    var z = Math.random()*N;
                    var y = geometry.vertices[Math.round(z)+Math.round(x)*N].y;
                    object.position.x = x;
                    object.position.y = y;
                    object.position.z = z;
                    //object.scale.set(2, 2, 2);
                    //var s =((Math.random()*100)+30)/400;
                    object.scale.set(s,s,s);
                    //scene.add(object.clone());
                    models.set(name, object);
                   // models.push(object);
                
            }, onProgress, onError );
        });
    
        
}
function addMesh(name)
{
   var model = models.get(name).clone();

   objectList.push(model);
    scene.add(model);
}