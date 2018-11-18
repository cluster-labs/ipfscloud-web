function parallax(){
    var yNew=($(document).scrollTop() / $(window).height()) * 100;
    $('.headline h1 .nr1').css('transform', 'translate3d(0, ' + yNew + '%, 0)');
    $('.headline h1 .nr2').css('transform', 'translate3d(0, ' + (yNew / 2) + '%, 0)');
    $('.headline h1 .nr3').css('transform', 'translate3d(0, ' + (yNew * 2) + '%, 0)');
    adjustBackground($('section.users'));
    adjustBackground($('section.community'));
    }
    function adjustBackground($el){
    var yNew=100 + (($el.offset().top - ($(document).scrollTop() + $(window).height())) / 20);
    if(yNew > 100)
    yNew=100;
    if(yNew < 0)
    yNew=0;
    $el.css({
    backgroundPosition: '50% ' + yNew + '%'
    });
    }
    $(document).ready(function(){
    $('.tp_recent_tweets ul').slick({
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    slidesToShow: 3,
    responsive: [
    {
    breakpoint: 1024,
    settings: {
    slidesToShow: 2,
    }},
    {
    breakpoint: 576,
    settings: {
    slidesToShow: 1,
    arrows: true
    }}
    ]
    });
    $(window).scroll(function(){
    parallax()
    });
    parallax();
    singleLetters($('.headline h1'));
    $('.headline h1 i').each(function(){
    var nr=1 + Math.floor(Math.random() * 3);
    $(this).addClass('nr' + nr);
    })
    $('#header-image').attr('src', $('#header-image').attr('data-src')).on('load', function(){
    $('article header').animate({opacity: 1}, 1000, function(){
    $('.headline .separator').animate({width: '100%'}, 1500, 'easeInOutQuad', function(){
    $('.headline h1 i').css('transform', 'translate3d(0,0,0)');
    setTimeout(function(){
    $('.headline h1').removeClass('has-delay');
    }, 1400);
    setTimeout(function(){
    $('.headline .subline').css('transform', 'translate3d(0,0,0)');
    initHeadline();
    }, 300);
    setTimeout(function(){
    $('.headline .teaser').css('transform', 'translate3d(0,0,0)');
    }, 400);
    });
    });
    });
    $('.newsletter-subscribe').submit(function(){
    var $form=$(this);
    var errors=false;
    if($form.find('input#email').val()===''){
    $form.find('.error').css('display', 'flex');
    errors=true;
    }
    var re=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String($form.find('input#email').val()).toLowerCase())){
    $form.find('.error').css('display', 'flex');
    errors=true;
    }
    if(errors)
    return false;
    $form.addClass('loading');
    $form.find('button').blur();
    jQuery.ajax({
    url:ajax_params.url,
    type:'post',
    dataType: 'JSON',
    data:{
    action:'marketo',
    nonce: ajax_params.nonce,
    data: {
    'action': 'newsletter-submission',
    'lead': {
    'email': $form.find('input#email').val()
    }}
    },
    success:function(response){
    $form.removeClass('loading');
    $form.find('.error').hide();
    $form.find('.success').css('display', 'flex');
    }});
    return false;
    });
    });
    var animationDelay=2500,
    barAnimationDelay=3800,
    barWaiting=barAnimationDelay - 3000,
    lettersDelay=50,
    typeLettersDelay=150,
    selectionDuration=500,
    typeAnimationDelay=selectionDuration + 800,
    revealDuration=600,
    revealAnimationDelay=1500;
    function initHeadline(){
    singleLetters($('.cd-headline.letters').find('b'));
    animateHeadline($('.cd-headline'));
    }
    function singleLetters($words){
    $words.each(function(){
    var word=$(this),
    letters=word.text().split(''),
    selected=word.hasClass('is-visible');
    for (i in letters){
    if(letters[i]===' ') letters[i]='&nbsp;';
    letters[i]=(selected) ? '<i class="in">' + letters[i] + '</i>': '<i>' + letters[i] + '</i>';
    }
    var newLetters=letters.join('');
    word.html(newLetters);
    });
    }
    function animateHeadline($headlines){
    var duration=animationDelay;
    $headlines.each(function(){
    var headline=$(this);
    var words=headline.find('.cd-words-wrapper b'),
    width=0;
    words.each(function(){
    var wordWidth=$(this).width();
    if(wordWidth > width) width=wordWidth;
    });
    headline.find('.cd-words-wrapper').css('width', width);
    setTimeout(function(){ hideWord(headline.find('.is-visible').eq(0)) }, duration);
    });
    }
    function hideWord($word){
    var nextWord=takeNext($word);
    var bool=($word.children('i').length >=nextWord.children('i').length) ? true:false;
    hideLetter($word.find('i').eq(0), $word, bool, lettersDelay);
    showLetter(nextWord.find('i').eq(0), nextWord, bool, lettersDelay);
    }
    function hideLetter($letter, $word, $bool, $duration){
    $letter.removeClass('in').addClass('out');
    if(!$letter.is(':last-child')){
    setTimeout(function(){ hideLetter($letter.next(), $word, $bool, $duration); }, $duration);
    }else if($bool){
    setTimeout(function(){ hideWord(takeNext($word)) }, animationDelay);
    }
    if($letter.is(':last-child')&&$('html').hasClass('no-csstransitions')){
    var nextWord=takeNext($word);
    switchWord($word, nextWord);
    }}
    function showLetter($letter, $word, $bool, $duration){
    $letter.addClass('in').removeClass('out');
    if(!$letter.is(':last-child')){
    setTimeout(function(){ showLetter($letter.next(), $word, $bool, $duration); }, $duration);
    }else{
    if($word.parents('.cd-headline').hasClass('type')){ setTimeout(function(){ $word.parents('.cd-words-wrapper').addClass('waiting'); }, 200);}
    if(!$bool){ setTimeout(function(){ hideWord($word) }, animationDelay) }}
    }
    function takeNext($word){
    return (!$word.is(':last-child')) ? $word.next():$word.parent().children().eq(0);
    }
    function takePrev($word){
    return (!$word.is(':first-child')) ? $word.prev():$word.parent().children().last();
    }
    function switchWord($oldWord, $newWord){
    $oldWord.removeClass('is-visible').addClass('is-hidden');
    $newWord.removeClass('is-hidden').addClass('is-visible');
    };