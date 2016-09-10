$(function(){
	$('button').click(function(){
		var data = $('form').serialize();
		data['ticker'] = $('#symbol').innerHTML;

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
