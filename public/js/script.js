let addTechnologysBtn = document.getElementById('addTechnologysBtn');
let technologyList = document.querySelector('.technologyList');
let technologyDiv = document.querySelectorAll('.technologyDiv')[0];

addTechnologysBtn.addEventListener('click', function(){
  let newTechnologys = technologyDiv.cloneNode(true);
  const input = newTechnologys.getElementsByTagName('input')[0];
  input.value ='';
  technologyList.appendChild(newTechnologys);
});


var content = [
  {id: "Agriculture", text: "Agriculture"},
  {id: "Defense", text: "Defense"},
  {id: "Health Care", text: "Health Care"},
];




