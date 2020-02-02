$(function () {
	// ON CLICK OF 'GET SCRAPIN'! BUTTON
	$("#getScrapin").on("click", function () {
		$.getJSON("/articles", function (data) {
			for (var i = 0; i < data.length; i++) {
				$("#articles").append("<h3 data-id='" + data[i]._id + "'>" + data[i].headline + "</h3>" + data[i].summary + "..." + " ");
				$("#articles").append("<a href = '" + data[i].url + "'</a>" + "<button data-id='" + data._id + "' id='goToArticle'>Go To Article</button>" + " ");
				$("#articles").append("<data-id='" + data[i]._id + "'>" + "<button type='button' data-id='" + data[i]._id + "' data-toggle='modal' data-target='#commentModal' id='comment-btn'>View Comments</button>");
			}
			$("#clear").on("click", function () {
				$("#articles").empty();
			})
		});
	});

	// VIEW COMMENTS BUTTON
	$(document).on("click", "#comment-btn", function () {
		$(".modal-body").empty();
		let thisId = $(this).attr("data-id");
		$("#save").attr("data-id", thisId);
		$.ajax({
			method: "GET",
			url: `/articles/${thisId}`
		}).then(data => {
			modal(data);
		});
	});

	// SAVE COMMENT BUTTON
	$(document).on("click", "#save", function () {

		let thisId = $(this).attr("data-id");
		let title = $("#titleInput").val();
		let body = $("#bodyInput").val();

		$.ajax({
			method: "POST",
			url: `/articles/${thisId}`,
			data: {
				title: title,
				body: body
			}
		})
	});

	// DELETE A COMMENT
	$(document).on("click", "#deleteComment", function () {
		let thisId = $(this).attr("data-id");
		$.ajax({
			method: "DELETE",
			url: `/notes/${thisId}`
		})
	});
});

function modal(data) {
	$("#modalLabel").text(data.headline);
	$(".modal-body").append(`<form><div class='form-group'><input type='text' class='form-control' id='titleInput' placeholder='Subject'></div><div class='form-group'><textarea class='form-control' id='bodyInput' placeholder='What are your thoughts?'></textarea></div></form>`);
	if (data.note.length > 0) {
		for (let i = 0; i < data.note.length; i++) {
			$(".modal-body").prepend(`<div class='card'><div class='card-body'><h5 class='card-title'>${data.note[i].title}</h5><p class='card-text'>${data.note[i].body}</p><button class='btn btn-danger' data-dismiss='modal' id='deleteComment' data-id='${data.note[i]._id}'>Delete</button></div></div><br />`);
		}
	}
};

