'use strict';
const SEM_NAMES=['Primer','Segundo','Tercer','Cuarto','Quinto','Sexto','Séptimo','Octavo','Noveno'];
const VEN_LABEL={3:'3er semestre vencido',4:'4to semestre vencido',5:'5to semestre vencido',6:'6to semestre vencido',7:'7mo semestre vencido',8:'8vo semestre vencido'};

const MALLA=[
[1,'INF-111','Programación I',[]],
[1,'INF-112','Fundamentos Digitales',[]],
[1,'INF-113','Programación Web I',[]],
[1,'INF-114','Álgebra',[]],
[1,'INF-115','Cálculo I',[]],
[1,'INF-116','Física',[]],
[2,'INF-121','Programación II',['INF-111']],
[2,'INF-122','Programación Web II',['INF-113']],
[2,'INF-123','Electrónica General I',['INF-112','INF-116']],
[2,'INF-124','Estadística I',['INF-114']],
[2,'INF-125','Álgebra Lineal',['INF-114']],
[2,'INF-126','Cálculo II',['INF-115']],
[3,'INF-131','Programación III',['INF-121']],
[3,'INF-132','Base de Datos I',['INF-121']],
[3,'INF-133','Programación Web III',['INF-111','INF-122']],
[3,'INF-134','Estadística II',['INF-124']],
[3,'INF-135','Sistemas Operativos',['INF-121']],
[3,'TRA-136','Metodología de la Investigación',['INF-124','INF-125']],
[4,'INF-241','Análisis y Diseño de Sistemas I',['INF-132']],
[4,'INF-242','Redes I',['INF-135']],
[4,'INF-243','Investigación Operativa I',['INF-134']],
[4,'INF-244','Introducción a la Robótica',['INF-123','INF-124']],
[4,'INF-245','Programación de Dispositivos Móviles I',['INF-131','INF-133']],
[4,'INF-246','Fundamentos de Diseño y Animación',['INF-125','INF-133']],
[5,'INF-251','Ingeniería de Software I',['INF-241']],
[5,'INF-252','Base de Datos II',['INF-132']],
[5,'INF-253','Análisis y Diseño de Sistemas II',['INF-241']],
[5,'INF-254','Programación de Dispositivos Móviles II',['INF-245']],
[5,'TRA-256','Legislación Informática y Ética',['V3']],
[6,'INF-261','Ingeniería de Software II',['INF-251']],
[6,'INF-262','Base de Datos III',['INF-252']],
[6,'INF-263','Desarrollo de Aplicaciones Multimedia',['INF-246']],
[6,'INF-264','Emprendimiento e Innovación Tecnológica',['TRA-256']],
[6,'INF-266','Taller de Proyecto',['V5']],
[7,'INF-371','Seguridad de la Información',['INF-242']],
[7,'INF-372','Inteligencia Artificial',['INF-262']],
[7,'INF-373','Métodos Numéricos I',['INF-126']],
[7,'TRA-374','Práctica Profesional',['V6']],
[8,'INF-381','Simulación de Sistemas',['INF-243']],
[8,'INF-382','Ingeniería de Software III',['INF-261']],
[8,'INF-384','Taller de Graduación I',['V7']],
[9,'INF-391','Taller de Graduación II',['V8']]
].map(function(r){return {sem:r[0],sigla:r[1],name:r[2],pre:r[3],type:'malla'};});

const SLOTS=[
{sigla:'E1',name:'Electiva I',sem:5,pre:['V4'],slot:1,type:'slot'},
{sigla:'E2',name:'Electiva II',sem:6,pre:['V4'],slot:2,type:'slot'},
{sigla:'E3',name:'Electiva III',sem:7,pre:['V5'],slot:3,type:'slot'},
{sigla:'E4',name:'Electiva IV',sem:7,pre:['V5'],slot:4,type:'slot'},
{sigla:'E5',name:'Electiva V',sem:8,pre:['V6'],slot:5,type:'slot'},
{sigla:'E6',name:'Electiva VI',sem:8,pre:['V6'],slot:6,type:'slot'}
];

const TEC=[
{sigla:'TVD-251',name:'Programación Gráfica',group:'Desarrollo de Videojuegos',pre:[],slot:1,type:'tec'},
{sigla:'TVD-261',name:'Animación Digital 2D y 3D',group:'Desarrollo de Videojuegos',pre:[],slot:2,type:'tec'},
{sigla:'TAW-251',name:'Desarrollo Web BackEnd',group:'Desarrollo de Aplicaciones Web',pre:[],slot:1,type:'tec'},
{sigla:'TAW-261',name:'Ingeniería Web',group:'Desarrollo de Aplicaciones Web',pre:[],slot:2,type:'tec'},
{sigla:'TIE-251',name:'Administración de Entornos Virtuales de Aprendizaje y Cursos Abiertos Masivos en Línea',group:'Informática Educativa',pre:[],slot:1,type:'tec'},
{sigla:'TIE-261',name:'Desarrollo de Software Educativo',group:'Informática Educativa',pre:[],slot:2,type:'tec'},
{sigla:'TAM-251',name:'Sistemas Embebidos',group:'Desarrollo de Aplicaciones Móviles',pre:[],slot:1,type:'tec'},
{sigla:'TAM-261',name:'Desarrollo de Aplicaciones Móviles Multiplataforma',group:'Desarrollo de Aplicaciones Móviles',pre:[],slot:2,type:'tec'}
];

const ELE=[
['INF-311','Minería de Datos (Data Mining)'],
['INF-312','Bioinformática'],
['INF-313','Realidad Aumentada y Virtual'],
['INF-314','Inglés Técnico'],
['INF-315','Preparación y Evaluación de Proyectos'],
['INF-316','Informática Forense'],
['INF-317','Internet de las Cosas'],
['INF-318','Computación en la Nube'],
['INF-319','Programación a Bajo Nivel'],
['INF-320','Auditoría de Sistemas'],
['INF-321','Cálculo III'],
['INF-322','Macrodatos y Analítica de Datos (Big Data)'],
['INF-323','Aprendizaje Automático (Machine Learning)'],
['INF-324','Aprendizaje Profundo (Deep Learning)'],
['INF-325','Derecho Informático'],
['INF-326','Negociaciones y Toma de Decisiones'],
['INF-327','Inteligencia de Negocios (Business Intelligence)'],
['INF-328','Visión por Computadora'],
['INF-329','Procesamiento Digital de Imágenes'],
['INF-330','Informática Médica'],
['INF-331','Investigación Operativa II'],
['INF-332','Hacking Ético I (Ética y Vulnerabilidad de Sistemas)'],
['INF-333','Redes II'],
['INF-334','Dirección de Proyectos Informáticos']
].map(function(r){return {sigla:r[0],name:r[1],pre:[],type:'ele'};});

const ALL=[].concat(MALLA,SLOTS,TEC,ELE);
const BY={};
for(const n of ALL){BY[n.sigla]=n;}
const CORE={};
for(const n of MALLA){(CORE[n.sem]=CORE[n.sem]||[]).push(n.sigla);}
const MALLA_TOTAL=MALLA.length+SLOTS.length;
