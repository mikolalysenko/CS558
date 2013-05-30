var createEditor = require("javascript-editor");

var editor = createEditor( { container: document.querySelector("#editor") } )

var map1 = {
	"Shift-Enter": function(cm)
	{
		var xhr = new XMLHttpRequest()
//		xhr.open("POST","http://128.104.191.51:8080/", true); //method, url, async
		xhr.open("POST", "http://" + "localhost" + ":8080", true); //method, url, async
		xhr.send(cm.getValue());
	}
};

//modify the webpage to add text field for output received formt he server, 
//as well as send button. 
document.getElementById("sendbutton").style.position="absolute";
document.getElementById("sendbutton").style.left="85%";
document.getElementById("sendbutton").style.top="10%";
document.getElementById("sendbutton").addEventListener("click", function()
					{
						var xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function()
								{
									console.log(xhr.readyState);
									if(xhr.readyState==4)
										console.log(xhr.status)

									//console.log(xhr.status + " " + xhr.readyState);
									if(xhr.readyState==4 && xhr.status==200)
									{
										console.log("sfg");
										console.log(String(xhr.responseText));
										updateText(xhr.responseText);
									}
								};
						xhr.open("POST", "http://" + "localhost:" + "8080", true);
						xhr.send(editor.getValue());
					}
);
document.getElementById("textarea1").style.position="absolute";
document.getElementById("textarea1").style.left="80%";
document.getElementById("textarea1").style.top="15%";
document.getElementById("textarea1").style.value="";
var updateText = function(str)
{
	document.getElementById("textarea1").value=str;
}

editor.editor.addKeyMap(map1);

editor.on("change", function() 
{
	var value = editor.getValue();
} );

