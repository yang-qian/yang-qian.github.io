
/*

	Toggle all reminder checkboxes

*/
var checkAllBoxesState = true;
function checkAllBoxes() {
	$("INPUT[type='checkbox']").attr('checked',checkAllBoxesState);
	checkAllBoxesState = !checkAllBoxesState;
	return false;
}