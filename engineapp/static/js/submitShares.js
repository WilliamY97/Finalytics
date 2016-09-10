$(function(){
	$('#addstock').click(function(e){
		e.preventDefault();
		var data = $('form').serialize();
		data += '&ticker=' + $('#symbol').text();
		console.log(data);

		$.ajax({
			url: '/submitShares',
			data: data,
			type: 'POST',
			success: function(response){
				console.log(response);
			},
			error: function(error){
				console.log(error);
			}
		});
	});
});
