export const transformWithoutBabel = (code) => {
  return (
    `
	  var global =
	    (typeof globalThis !== 'undefined' && globalThis.global) ||
	    (typeof globalThis !== 'undefined' && globalThis) ||
	    (typeof window !== 'undefined' && window) ||
	    (typeof self !== 'undefined' && self) ||
	    {};
	  if (typeof global.startFrom !== 'string') global.startFrom = '';
	  if (typeof global.timeLine !== 'number') global.timeLine = 0;
	  function updateProp(parentName, obj){
    Object.keys(obj).map(function(key){
      if (typeof obj[key] != 'object'){
        if(document.getElementById('input-' + parentName + '-' + key) && document.getElementById('input-' + parentName + '-' + key).value != '') {
          var updatedValue = document.getElementById('input-' + parentName + '-' + key).value;
          if(!isNaN(updatedValue)) updatedValue = parseInt(updatedValue, 10);
          obj[key] = updatedValue;
        }
      }
      else{
        obj[key] = updateProp(parentName + '-' + key, obj[key]);
      }
    });
    return obj;
  }
  function restoreHeap(restore){
    let snapshot;
    heap.snapshots.map(element => {
      if(element.timePointId == restore) snapshot = element;
    })
    return snapshot;
  }
  emptyContinuation = '';
  emptyContinuationAux = '';
  contTimeLine = {};
  function addCont(cont, continuations, originalId){

    let counter = 0;
    let id = originalId;
	    let startFrom = typeof global.startFrom === 'string' ? global.startFrom : '';
	    let startFromNumber = startFrom;

	    let i = 0;
	    while(isNaN(parseInt(startFromNumber))){
	        startFromNumber = startFrom.slice(i); 
	        if (i > startFrom.length) break;
	        ++i;
	    }

	    if(i <= startFrom.length){
	        let startFromName = startFrom.slice(0, i-1);
	        if( id == 'kont' + startFromName) {
	          counter = parseInt(startFromNumber); 
	          id = id + (++counter);  
        } 
    }

    while(continuations[id] && (contTimeLine[id] == global.timeLine)){
      id = originalId + (++counter);
    }
    continuations[id] = cont;
    contTimeLine[id] = global.timeLine;
  } try{` +
    code +
    `} 
  catch(e){
    emptyContinuation = createContinuation();
    if(emptyContinuationAux) {                
      emptyContinuation = emptyContinuationAux;
    }
    console.error(e)
  }
  `
  );
};
