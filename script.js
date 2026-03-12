// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID",
  databaseURL: "https://SEU_PROJETO.firebaseio.com"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();


// MAPA NO index.html
let map = L.map('map').setView([-15.7801, -47.9292], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker;


map.on('click', function(e){
  if(marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);
});


// PREVIEW DE IMAGENS
const fotosInput = document.getElementById("fotos");
const preview = document.getElementById("preview");


fotosInput.addEventListener("change", function(){
  preview.innerHTML = '';
  for(let file of this.files){
    const reader = new FileReader();
    reader.onload = function(e){
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    }
    reader.readAsDataURL(file);
  }
});


// ENVIO DE DENÚNCIA
document.getElementById("denunciaForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const rua = this.querySelector('input').value;
  const desc = this.querySelector('textarea').value;
  if(!marker) { alert("Selecione o local no mapa."); return; }


  const fotosURLs = [];
  for(let file of fotosInput.files){
    const storageRef = storage.ref('fotos/' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    fotosURLs.push(url);
  }


  const novaDenuncia = {
    rua: rua,
    descricao: desc,
    fotos: fotosURLs,
    lat: marker.getLatLng().lat,
    lng: marker.getLatLng().lng,
    status: "pendente",
    timestamp: Date.now()
  };
  db.ref('denuncias').push(novaDenuncia);
  alert("Denúncia enviada com sucesso!");
  this.reset();
  preview.innerHTML = '';
  map.removeLayer(marker);
});
