'use strict';
//Asetetaan canvas ja konteksti null:eiksi alussa
var canvas= null;
var ctx  = null;
//Kertoo onko peli käynnissä(true) vai päättynyt(false)
var state = true;

//Haetaan canvas id:n perusteella
canvas = document.getElementById('canvas');

//Canvasin leveys ja korkeus
var cwidth = 600;
var cheight = 500;
canvas.width = cwidth;
canvas.height = cheight;

//Haetaan konteksti
ctx = canvas.getContext('2d');

//Pelin päivityksestä vastaava funktio
var gLoop;

//Muuttuja, joka kuvaa taustakuvan oikean reunan paikkaa
var backgroundLocation = 0;
var img = new Image();
img.src = 'images/tausta.png';

//TAUSTAN PIIRTÄMINEN___________________________________________________________
var render = function(){
	/*window.requestAnimationFrame tells the browser that you wish to perform
	 * an animation and requests that the browser schedule a repaint of the
	 * window for the next animation frame. The method takes as an argument a
	 * callback to be invoked before the repaint.*/ 
	window.requestAnimationFrame(render);
	/*Piirretään kuva velocityX:n määräämään paikkaan ja sen jälkeen pirretään
	 *sama kuva uudestaan sijoittaen se aivan ensiksi piirretyn kuvan jälkeen.*/
	ctx.drawImage(img, backgroundLocation, cheight - img.height);
	ctx.drawImage(img, img.width-Math.abs(backgroundLocation), 
			cheight - img.height);

	/*Taustakuva liikkuu nopeudella viisi eli se siirtyy aina viisi pikseliä
	 * vasemmalle--> pelaaja liikkuu nopeudella viisi pikseliä oikealle*/
	backgroundLocation -= 5;

	/*Ensimmäinen kuva sijoitetaan takaisin alkupaikalleen eli nollaan, mikäli
	 *itseisarvo backgroundLocation ylittää kuvan leveyden*/ 
	if (Math.abs(backgroundLocation) > img.width) {
		backgroundLocation = 0;
	}

	//Piirretään esineet
	for(var i = 0; i < items.length; i++){
		items[i].draw();
	}
	//Piirretään esteet
	for(var i=0; i < blocks.length; i++){
		blocks[i].draw();
	}
	//Piirretään tasot
	for(var i= 0; i<platforms.length; i++){
		platforms[i].draw();
	}
	//Piirretään pelaaja
	player.draw();
};

//PELAAJA________________________________________________________________________

//Luodaan pelaaja
var player = new Player();

function Player(){
	var that = this;
	//Luodaan pelaajan kuvake
	that.image = new Image();
	//Tiedostopolku, josta kuva haetaan
	that.image.src = "images/ukko.png";
	//Spriten yhden kehyksen leveys ja korkeus
	that.width = 134;
	that.height = 125;
	//Pelaajalla aluksi nolla pistettä
	that.points = 0;
	/*Spriten toinen kehys; numerointi alkaa nollasta eli ensimmäisen kehyksen
	 * indeksi on nolla.*/
	that.lastFrame = 1;
	//Kertoo, mikä kehys on kyseessä. Alussa ollaan ensimmäisessä kehyksessä.
	that.currentFrame = 0;

	//Hyppäämistarkasteluun tarvittavat attribuutit
	/*Kertovat, onko pelaaja hyppäämässä tai putoamassa; alussa pelaaja ei
	 *kumpaakaan*/
	that.jumping = false;
	that.falling = false;

	//Pelaajan hyppy- ja putoamisnopeudet
	that.jumpSpeed = 0;
	that.fallSpeed = 0;

	//Asettaa pelaajalle sijainnin
	that.setPosition = function(x, y){
		that.x = x;
		that.y = y;
	};

	/*Luodaan frameTime-muuttuja aikaa, jonka välein currentFrame ja lastFrame
	 * vaihtelevat*/
	that.frameTime = 0;
	that.draw = function(){
		/*Animointi: Kun actualFrame on nolla (kyseessä spriten 1. kuva), 
		 * piirretään kohdasta (0,0) lähtevä kuva eli spriten 1. kuva. Jos
		 * taas actualFrame on yksi (kyseessä spriten 2. kuva), piirretään
		 * kohdasta (0, that.height) lähtevä kuva eli spriten 2. kuva.*/
		ctx.drawImage(that.image, 0, that.height * that.currentFrame,
				that.width, that.height, that.x, that.y, that.width,
				that.height);

		/*Pelaajan jalat liikkuvat vain, mikäli pelaaja ei ole hypyssä eikä
		 *putoamassa */
		if(!player.jumping && !player.falling){
			if (that.frameTime == 5) {
				/*Jos nykyinen kehys on sama kuin toinen kehys, palataan
				 * takaisin ensimmäiseen kehykseen*/
				if (that.currentFrame == that.lastFrame) {
					that.currentFrame = 0;
				}
				/*Muulloin kasvatetaan kehyksen indeksiä yhdellä eli siirrytään
				 *ensimmäisestä kehyksestä toiseen kehykseen*/
				else {
					that.currentFrame++;	
				}
				//Asetetaan aika nollaksi eli palataan alkutilanteeseen
				that.frameTime = 0;
			}
			//Muulloin kasvatetaan timea yhdellä
			that.frameTime++;    
		}
		//Pelaajan hypätessä tai pudotessa näytetään spriten toinen kuva
		else{
			that.currentFrame = 1;
		}
	};

	//Hypyn käynnistävä funktio
	that.startJump = function(){
		/*Mikäli pelaaja ei ole vielä hypyssä eikä putoamassa, lähetetään se
		 * hyppyyn. Näin saadaan estettyä tuplahypyt tai ilmasta hyppäämiset*/
		if(!that.jumping && !that.falling){
			that.fallSpeed = 0;
			that.jumping = true;
			//Annetaan pelaajalle alkunopeus
			that.jumpSpeed = 20;  
		}
	};
	/*Huolehtii, mitä sen jälkeen tapahtuu, kun startJump-funktio on
	 *käynnistänyt hyppäämisen*/
	that.jump = function(){
		//Pelaajan sijainti muuttuu ylöspäin jumpSpeedin verran pikseleissä
		that.setPosition(that.x, that.y - that.jumpSpeed);
		//Hyppynopeus pienenee gravitaation vaikutuksesta
		that.jumpSpeed--;
		/*Hyppynopeuden ollessa nolla (hypyn lakipiste), käynnistetään pelaajan
		 * putoaminen*/
		if(that.jumpSpeed == 0){
			that.startFall();
		}
	};
	//Funktio, joka käynnistää pelaajan putoamisen
	that.startFall = function(){
		that.jumping = false;
		that.falling = true;
		//Asetetaan pelaajalle putoamisnopeus
		that.fallSpeed = 1;
	};
	/*Huolehtii, mitä sen jälkeen tapahtuu, kun startFall-funktio on
	 * käynnistänyt putoamisen*/
	that.fall = function(){
		/*Tarkastetaan, onko pelaaja maanpinnan yläpuolella; Jos näin on,
		 * pelaaja lähtee putoamaan*/
		if(that.y < cheight - that.height){
			/*Kasvatetaan pelaajan y-koordinaattia putoamisnopeuden verran
			 * pikseleissä*/
			that.setPosition(that.x, that.y + that.fallSpeed);
			//Pelaajan putoamisnopeus kasvaa gravitaation vaikutuksesta
			that.fallSpeed++;
		}
		//Muulloin (eli jos pelaaja maanpinnalla) pysäytetään putoaminen.
		else{
			that.falling = false;
			that.fallSpeed = 0;
		}
	};
};

//ESINEET________________________________________________________________________
//Luodaan esineet
var nroOfItems = 5;
var items = new Array();

var itemWidth = 10;
var itemHeight = 10;

var Item = function(x, y, type){
	var that = this;
	that.x = x;
	that.y = y;
	//Tyyppi kertoo, mikä esineen kuvake on kyseessä
	that.type = type;

	/*Viimeinen parametri on läpinäkyvyys, joka on luku väliltä 0.0(täysin
	 * läpinäkyvä) ja 1.0(täysin peittävä)*/
	//Luodaan pelaajan kuvake
	that.image = new Image();

	//Tiedostopolku, josta kuva haetaan, vaihtelee kuvakkeesta riippuen
	if(type == 0){
		that.image.src = "images/juusto.png";}

	else if(type == 1){
		that.image.src = "images/viinipullo.png";}

	else if(type == 2){
		that.image.src = "images/maitotonkka.png";}
	that.draw = function(){
		//Kuvan koordinaatit
		ctx.drawImage(that.image, that.x, that.y);
	};
};

var generateItems = function(){
	var position = 200;
	for(var i = 0; i<nroOfItems; i++){
		/*Luodaan uusi taso; arvotaan tasolle satunnainen x-koordinaatti;
		 *kuitenkin niin, että taso jää canvasin sisään. 2*Math.random()
		 *antaa satunnaisen luvun väliltä 0-2 ja pyöristämällä se saadaan
		 *luku 0, 1 tai 2*/
		items.push(new Item(500+Math.random()*cwidth-itemWidth, position,
				Math.round(2*Math.random())));

		/*Jo kyseessä on mikä muu tahansa taso kuin positio=200:n korkeudelle
		 *sijoitettu ensimmäinen taso, lisätään positioniin canvasin korkeus
		 *jaettuna tasojen lukumäärällä*/
		if(position<cheight-itemHeight){
			position += ~~(cheight/(nroOfItems/2));
		}
	}
};

//ESTEET_________________________________________________________________________

var nroOfBlocks = 1;
//Luodaan este-taulukko
var blocks = new Array();
/*Asetetaan esine-kuvakkeen leveydeksi ja korkeudeksi oikeaa kuvanleveytta
 * ja -korkeutta pienemmät arvot, jotta pelaaja pystyy ylittämään esteitä 
 * osumatta niihin*/
var blockWidth = 10;
var blockHeight = 10;

var Block = function(x, y, type){
	var that = this;
	that.x = x;
	that.y = y;
	//Tyyppi kertoo, mikä esteen kuvake on kyseessä
	that.type = type;

	/*Viimeinen parametri on läpinäkyvyys, joka on luku väliltä 0.0(täysin
	 * läpinäkyvä) ja 1.0(täysin peittävä)*/
	//Luodaan pelaajan kuvake
	that.image = new Image();

	//Tiedostopolku, josta kuva haetaan, vaihtelee kuvakkeesta riippuen
	if(type == 0){
		that.image.src = "images/kuoppa.png";}

	else if(type == 1){
		that.image.src = "images/kivi.png";}

	that.draw = function(){
		//Kuvan koordinaatit
		ctx.drawImage(that.image, that.x, that.y);
	};
};

//Luodaan esteet
var generateBlocks = function(){
	for(var i = 0; i<nroOfBlocks; i++){
		/*Luodaan uusi taso; arvotaan tasolle satunnainen x-koordinaatti;
		 *kuitenkin niin, että taso jää canvasin sisään. */
		blocks.push(new Block(500+Math.abs(backgroundLocation)+(Math.random()*
				cwidth-blockWidth), 430, Math.round(Math.random())));
	}
};

//TASOT__________________________________________________________________________
var nroOfPlatforms = 5;
var platforms = new Array();
//platforms.length = 5;

var platformWidth = 100;
var platformHeight = 20;

var platform = function(x, y){
	var that = this;
	that.width = 150;
	that.height = 20;

	that.x = x;
	that.y = y;

	/*Viimeinen parametri on läpinäkyvyys, joka on luku väliltä 0.0(täysin
	 * läpinäkyvä) ja 1.0(täysin peittävä)*/
	//Luodaan pelaajan kuvake
	that.image = new Image();
	//Tiedostopolku, josta kuva haetaan
	that.image.src = "images/taso.png";

	that.draw = function(){
		//Kuvan koordinaatit
		ctx.drawImage(that.image, that.x, that.y);
	};
	return that;
};

//Generoidaan tasot
var generatePlatforms = function(){ 
	//Tason y-koordinatti
	var position = 220;

	for(var i = 0; i<nroOfPlatforms; i++){
		/*Luodaan uusi taso; arvotaan tasolle satunnaisluku väliltä 0-1 ja
		 * kerrotaan se (cwidth-platformWidth):llä, jolloin saadaan tasolle
		 * paikka jostakin kohtaa canvasia. Lisätään tähän koordinaattiin vielä
		 * 500, jolloin tasot eivät ilmesty tyhjästä keskelle näyttöä*/
		platforms.push(new platform(500+Math.random()*cwidth-platformWidth,
				position));
		/*Jo kyseessä on mikä muu tahansa taso kuin positio=200:n korkeudelle
		 *sijoitettu ensimmäinen taso, lisätään positioniin canvasin korkeus
		 *jaettuna tasojen lukumäärällä */
		if(position<cheight-platformHeight){
			position += ~~(cheight/(nroOfPlatforms/2));
		}
	}
};

//PELAAJAN KONTROLLI JA TÖRMÄYKSET_______________________________________________

//Törmäysten tarkastus
var checkCollision = function(x1, y1, w1, h1, x2, y2, w2, h2){
	var left1, right1, top1, bottom1;
	var left2, right2, top2, bottom2;

	//Nelikulmion kaikki reunat
	left1 = x1;
	right1 = x1 + player.width;
	top1 = y1;
	bottom1 = y1 + player.height;

	left2 = x2;
	right2 = x2 + blockWidth;
	top2 = y2;
	bottom2 = y2 + blockHeight;

	if(bottom1 < top2){
		return false;
	}
	else if(top1 > bottom2){
		return false;
	}
	else if(right1 < left2){
		return false;
	}
	else if(left1 > right2){
		return false;
	}
	else{
		return true;
	}
};

//Lopettaa pelin
var gameOver = function(){
	state = false;
	//lopetetaan kutsumasta gameloopia ja generointimetodeja
	clearTimeout(gLoop);
	clearTimeout(generatePlatforms);
	clearTimeout(generateItems);
	clearTimeout(generateBlocks);
	//Tyhjennetään canvas
	canvas.width = canvas.width;
};

var GameLoop = function(){
	//Pelaaja ei saa mennä canvasin alapuolelle
	if(player.y + player.height > cwidth){
		player.setPosition(player.x, cwidth-player.height);
	}
	/*Mikäli pelaajan pisteet eivät ole laskeneet liian, peli on käynnissä ja
	 *pistelaskuri näyttää pelaajan pisteitä*/
	if(player.points > -10){
		document.getElementById('points').innerHTML= "Pisteet: " +
		player.points;
	}
	/*Muulloin peli päättyy ja laskurin tilalle tulee ilmoitus siitä sekä pelaajan
	 * lopullinen pistesaldo */
	else{
		gameOver();
		document.getElementById('points').innerHTML= 
			"Kompastuit liian monta kertaa ja eukko tipahti kyydistä! " +
			"Pistesaldosi: " + player.points;
	}

	//Jos pelaaja hyppäämässä, kutsutaan jump()-funktiota
	if(player.jumping){
		player.jump();
	}
	//Jos pelaaja putoamassa, kutsutaan fall()-funktiota
	if(player.falling){
		player.fall();
	}

	//Siirretään tasoja
	for (var i=0; i<platforms.length; i++){
		platforms[i].x = platforms[i].x-5;
	}
	//Siirretään esineitä
	for (var i=0; i<items.length; i++){
		items[i].x = items[i].x-5;
	}
	//Siirretään esteitä
	for (var i=0; i<blocks.length; i++){
		blocks[i].x = blocks[i].x-5;
	}

	//Tarkastetaan törmäykset
	for(var i=0; i<platforms.length; i++){
		var p = platforms[i];
//		jos checkCollision-metodi palauttaa true
		if(checkCollision(player.x, player.y, player.width, player.height, 
				p.x, p.y, p.width, p.height)){
			/*Pelaajan hypätessä tason päälle siirretään pelaaja-kuvakkeen
			 * alareuna samalle sijainnille kuin tason yläreuna */
			player.setPosition(player.x, p.y-player.height);
			/*Kutsutaan putoamisen käynnistävää startFall-metodia sekunnin
			 *kuluttua siitä, kun pelaaja on asetettu tason päälle
			 *-->Pelaaja putoaa takaisin maahan, kun taso päättyy*/
			setTimeout(player.startFall, 1100);
		};
	}
	//jos checkCollision-metodi palauttaa true
	for(var i=0; i<items.length; i++){
		if(checkCollision(player.x, player.y, player.width, player.height, 
				items[i].x, items[i].y, items[i].width, items[i].height)){
			/*Jos pelaaja osuu esineeseen, esine katoaa(poistetaan 
			 * items-listasta) ja pelaajan pistesaldo kasvaa yhdellä)*/
			items.splice(i, 1);
			//Pelaaja saa pisteitä kerätessään esineitä
			player.points = player.points + 3;
			//Haetaan ääni audio-tagista ja soitetaan se
			var blopSound = document.getElementById("blop");
			blopSound.play();
		}
	}

	for(var i=0; i<blocks.length; i++){
		if(checkCollision(player.x, player.y, player.width, player.height, 
				blocks[i].x, blocks[i].y, blocks[i].width, blocks[i].height)){
			//Haetaan ääni audio-tagista ja soitetaan se
			var autsSound = document.getElementById("auts");
			autsSound.play();
			//Pelaaja menettää pisteitä törmätessään kuoppaan tai kiveen
			player.points--;
		}
	}
	//Kutsutaan Gameloop-funktiota 20ms välein
	if(state){
		gLoop = setTimeout(GameLoop, 1000 / 50);
	}
};
//Asetetaan pelaajalle sijainti
player.setPosition((cwidth-player.width)/3, cheight-player.height);
//Generoidaan esineet, jotta niitä ilmestyy heti pelikentän alusta
generateItems();

////Rekisteröidään sivulle onload-kuuntelija
window.addEventListener("load",function() {
	render();
	//Generoidaan tasot kolmen sekunnin välein
	setInterval(generatePlatforms, 4000);
	setInterval(generateItems, 4000);
	setInterval(generateBlocks, 6000);
	GameLoop();
});
