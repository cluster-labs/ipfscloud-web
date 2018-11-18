(function($){
    'use strict';
    if(typeof wpcf7==='undefined'||wpcf7===null){
    return;
    }
    wpcf7=$.extend({
    cached: 0,
    inputs: []
    }, wpcf7);
    $(function(){
    wpcf7.supportHtml5=(function(){
    var features={};
    var input=document.createElement('input');
    features.placeholder='placeholder' in input;
    var inputTypes=[ 'email', 'url', 'tel', 'number', 'range', 'date' ];
    $.each(inputTypes, function(index, value){
    input.setAttribute('type', value);
    features[ value ]=input.type!=='text';
    });
    return features;
    })();
    $('div.wpcf7 > form').each(function(){
    var $form=$(this);
    wpcf7.initForm($form);
    if(wpcf7.cached){
    wpcf7.refill($form);
    }});
    });
    wpcf7.getId=function(form){
    return parseInt($('input[name="_wpcf7"]', form).val(), 10);
    };
    wpcf7.initForm=function(form){
    var $form=$(form);
    $form.submit(function(event){
    if(typeof window.FormData!=='function'){
    return;
    }
    wpcf7.submit($form);
    event.preventDefault();
    });
    $('.wpcf7-submit', $form).after('<span class="ajax-loader"></span>');
    wpcf7.toggleSubmit($form);
    $form.on('click', '.wpcf7-acceptance', function(){
    wpcf7.toggleSubmit($form);
    });
    $('.wpcf7-exclusive-checkbox', $form).on('click', 'input:checkbox', function(){
    var name=$(this).attr('name');
    $form.find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
    });
    $('.wpcf7-list-item.has-free-text', $form).each(function(){
    var $freetext=$(':input.wpcf7-free-text', this);
    var $wrap=$(this).closest('.wpcf7-form-control');
    if($(':checkbox, :radio', this).is(':checked')){
    $freetext.prop('disabled', false);
    }else{
    $freetext.prop('disabled', true);
    }
    $wrap.on('change', ':checkbox, :radio', function(){
    var $cb=$('.has-free-text', $wrap).find(':checkbox, :radio');
    if($cb.is(':checked')){
    $freetext.prop('disabled', false).focus();
    }else{
    $freetext.prop('disabled', true);
    }});
    });
    if(! wpcf7.supportHtml5.placeholder){
    $('[placeholder]', $form).each(function(){
    $(this).val($(this).attr('placeholder'));
    $(this).addClass('placeheld');
    $(this).focus(function(){
    if($(this).hasClass('placeheld')){
    $(this).val('').removeClass('placeheld');
    }});
    $(this).blur(function(){
    if(''===$(this).val()){
    $(this).val($(this).attr('placeholder'));
    $(this).addClass('placeheld');
    }});
    });
    }
    if(wpcf7.jqueryUi&&! wpcf7.supportHtml5.date){
    $form.find('input.wpcf7-date[type="date"]').each(function(){
    $(this).datepicker({
    dateFormat: 'yy-mm-dd',
    minDate: new Date($(this).attr('min')),
    maxDate: new Date($(this).attr('max'))
    });
    });
    }
    if(wpcf7.jqueryUi&&! wpcf7.supportHtml5.number){
    $form.find('input.wpcf7-number[type="number"]').each(function(){
    $(this).spinner({
    min: $(this).attr('min'),
    max: $(this).attr('max'),
    step: $(this).attr('step')
    });
    });
    }
    $('.wpcf7-character-count', $form).each(function(){
    var $count=$(this);
    var name=$count.attr('data-target-name');
    var down=$count.hasClass('down');
    var starting=parseInt($count.attr('data-starting-value'), 10);
    var maximum=parseInt($count.attr('data-maximum-value'), 10);
    var minimum=parseInt($count.attr('data-minimum-value'), 10);
    var updateCount=function(target){
    var $target=$(target);
    var length=$target.val().length;
    var count=down ? starting - length:length;
    $count.attr('data-current-value', count);
    $count.text(count);
    if(maximum&&maximum < length){
    $count.addClass('too-long');
    }else{
    $count.removeClass('too-long');
    }
    if(minimum&&length < minimum){
    $count.addClass('too-short');
    }else{
    $count.removeClass('too-short');
    }};
    $(':input[name="' + name + '"]', $form).each(function(){
    updateCount(this);
    $(this).keyup(function(){
    updateCount(this);
    });
    });
    });
    $form.on('change', '.wpcf7-validates-as-url', function(){
    var val=$.trim($(this).val());
    if(val
    && ! val.match(/^[a-z][a-z0-9.+-]*:/i)
    && -1!==val.indexOf('.')){
    val=val.replace(/^\/+/, '');
    val='http://' + val;
    }
    $(this).val(val);
    });
    };
    wpcf7.submit=function(form){
    if(typeof window.FormData!=='function'){
    return;
    }
    var $form=$(form);
    $('.ajax-loader', $form).addClass('is-active');
    $('[placeholder].placeheld', $form).each(function(i, n){
    $(n).val('');
    });
    wpcf7.clearResponse($form);
    var formData=new FormData($form.get(0));
    var detail={
    id: $form.closest('div.wpcf7').attr('id'),
    status: 'init',
    inputs: [],
    formData: formData
    };
    $.each($form.serializeArray(), function(i, field){
    if('_wpcf7'==field.name){
    detail.contactFormId=field.value;
    }else if('_wpcf7_version'==field.name){
    detail.pluginVersion=field.value;
    }else if('_wpcf7_locale'==field.name){
    detail.contactFormLocale=field.value;
    }else if('_wpcf7_unit_tag'==field.name){
    detail.unitTag=field.value;
    }else if('_wpcf7_container_post'==field.name){
    detail.containerPostId=field.value;
    }else if(field.name.match(/^_wpcf7_\w+_free_text_/)){
    var owner=field.name.replace(/^_wpcf7_\w+_free_text_/, '');
    detail.inputs.push({
    name: owner + '-free-text',
    value: field.value
    });
    }else if(field.name.match(/^_/)){
    }else{
    detail.inputs.push(field);
    }});
    wpcf7.triggerEvent($form.closest('div.wpcf7'), 'beforesubmit', detail);
    var ajaxSuccess=function(data, status, xhr, $form){
    detail.id=$(data.into).attr('id');
    detail.status=data.status;
    detail.apiResponse=data;
    var $message=$('.wpcf7-response-output', $form);
    switch(data.status){
    case 'validation_failed':
    $.each(data.invalidFields, function(i, n){
    $(n.into, $form).each(function(){
    wpcf7.notValidTip(this, n.message);
    $('.wpcf7-form-control', this).addClass('wpcf7-not-valid');
    $('[aria-invalid]', this).attr('aria-invalid', 'true');
    });
    });
    $message.addClass('wpcf7-validation-errors');
    $form.addClass('invalid');
    wpcf7.triggerEvent(data.into, 'invalid', detail);
    break;
    case 'acceptance_missing':
    $message.addClass('wpcf7-acceptance-missing');
    $form.addClass('unaccepted');
    wpcf7.triggerEvent(data.into, 'unaccepted', detail);
    break;
    case 'spam':
    $message.addClass('wpcf7-spam-blocked');
    $form.addClass('spam');
    $('[name="g-recaptcha-response"]', $form).each(function(){
    if(''===$(this).val()){
    var $recaptcha=$(this).closest('.wpcf7-form-control-wrap');
    wpcf7.notValidTip($recaptcha, wpcf7.recaptcha.messages.empty);
    }});
    wpcf7.triggerEvent(data.into, 'spam', detail);
    break;
    case 'aborted':
    $message.addClass('wpcf7-aborted');
    $form.addClass('aborted');
    wpcf7.triggerEvent(data.into, 'aborted', detail);
    break;
    case 'mail_sent':
    $message.addClass('wpcf7-mail-sent-ok');
    $form.addClass('sent');
    wpcf7.triggerEvent(data.into, 'mailsent', detail);
    break;
    case 'mail_failed':
    $message.addClass('wpcf7-mail-sent-ng');
    $form.addClass('failed');
    wpcf7.triggerEvent(data.into, 'mailfailed', detail);
    break;
    default:
    var customStatusClass='custom-'
    + data.status.replace(/[^0-9a-z]+/i, '-');
    $message.addClass('wpcf7-' + customStatusClass);
    $form.addClass(customStatusClass);
    }
    wpcf7.refill($form, data);
    wpcf7.triggerEvent(data.into, 'submit', detail);
    if('mail_sent'==data.status){
    $form.each(function(){
    this.reset();
    });
    }
    $form.find('[placeholder].placeheld').each(function(i, n){
    $(n).val($(n).attr('placeholder'));
    });
    $message.html('').append(data.message).slideDown('fast');
    $message.attr('role', 'alert');
    $('.screen-reader-response', $form.closest('.wpcf7')).each(function(){
    var $response=$(this);
    $response.html('').attr('role', '').append(data.message);
    if(data.invalidFields){
    var $invalids=$('<ul></ul>');
    $.each(data.invalidFields, function(i, n){
    if(n.idref){
    var $li=$('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message));
    }else{
    var $li=$('<li></li>').append(n.message);
    }
    $invalids.append($li);
    });
    $response.append($invalids);
    }
    $response.attr('role', 'alert').focus();
    });
    };
    $.ajax({
    type: 'POST',
    url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/feedback'),
    data: formData,
    dataType: 'json',
    processData: false,
    contentType: false
    }).done(function(data, status, xhr){
    ajaxSuccess(data, status, xhr, $form);
    $('.ajax-loader', $form).removeClass('is-active');
    }).fail(function(xhr, status, error){
    var $e=$('<div class="ajax-error"></div>').text(error.message);
    $form.after($e);
    });
    };
    wpcf7.triggerEvent=function(target, name, detail){
    var $target=$(target);
    var event=new CustomEvent('wpcf7' + name, {
    bubbles: true,
    detail: detail
    });
    $target.get(0).dispatchEvent(event);
    $target.trigger('wpcf7:' + name, detail);
    $target.trigger(name + '.wpcf7', detail);
    };
    wpcf7.toggleSubmit=function(form, state){
    var $form=$(form);
    var $submit=$('input:submit', $form);
    if(typeof state!=='undefined'){
    $submit.prop('disabled', ! state);
    return;
    }
    if($form.hasClass('wpcf7-acceptance-as-validation')){
    return;
    }
    $submit.prop('disabled', false);
    $('.wpcf7-acceptance', $form).each(function(){
    var $span=$(this);
    var $input=$('input:checkbox', $span);
    if(! $span.hasClass('optional')){
    if($span.hasClass('invert')&&$input.is(':checked')
    || ! $span.hasClass('invert')&&! $input.is(':checked')){
    $submit.prop('disabled', true);
    return false;
    }}
    });
    };
    wpcf7.notValidTip=function(target, message){
    var $target=$(target);
    $('.wpcf7-not-valid-tip', $target).remove();
    $('<span role="alert" class="wpcf7-not-valid-tip"></span>')
    .text(message).appendTo($target);
    if($target.is('.use-floating-validation-tip *')){
    var fadeOut=function(target){
    $(target).not(':hidden').animate({
    opacity: 0
    }, 'fast', function(){
    $(this).css({ 'z-index': -100 });
    });
    };
    $target.on('mouseover', '.wpcf7-not-valid-tip', function(){
    fadeOut(this);
    });
    $target.on('focus', ':input', function(){
    fadeOut($('.wpcf7-not-valid-tip', $target));
    });
    }};
    wpcf7.refill=function(form, data){
    var $form=$(form);
    var refillCaptcha=function($form, items){
    $.each(items, function(i, n){
    $form.find(':input[name="' + i + '"]').val('');
    $form.find('img.wpcf7-captcha-' + i).attr('src', n);
    var match=/([0-9]+)\.(png|gif|jpeg)$/.exec(n);
    $form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[ 1 ]);
    });
    };
    var refillQuiz=function($form, items){
    $.each(items, function(i, n){
    $form.find(':input[name="' + i + '"]').val('');
    $form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[ 0 ]);
    $form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[ 1 ]);
    });
    };
    if(typeof data==='undefined'){
    $.ajax({
    type: 'GET',
    url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/refill'),
    beforeSend: function(xhr){
    var nonce=$form.find(':input[name="_wpnonce"]').val();
    if(nonce){
    xhr.setRequestHeader('X-WP-Nonce', nonce);
    }},
    dataType: 'json'
    }).done(function(data, status, xhr){
    if(data.captcha){
    refillCaptcha($form, data.captcha);
    }
    if(data.quiz){
    refillQuiz($form, data.quiz);
    }});
    }else{
    if(data.captcha){
    refillCaptcha($form, data.captcha);
    }
    if(data.quiz){
    refillQuiz($form, data.quiz);
    }}
    };
    wpcf7.clearResponse=function(form){
    var $form=$(form);
    $form.removeClass('invalid spam sent failed');
    $form.siblings('.screen-reader-response').html('').attr('role', '');
    $('.wpcf7-not-valid-tip', $form).remove();
    $('[aria-invalid]', $form).attr('aria-invalid', 'false');
    $('.wpcf7-form-control', $form).removeClass('wpcf7-not-valid');
    $('.wpcf7-response-output', $form)
    .hide().empty().removeAttr('role')
    .removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked');
    };
    wpcf7.apiSettings.getRoute=function(path){
    var url=wpcf7.apiSettings.root;
    url=url.replace(wpcf7.apiSettings.namespace,
    wpcf7.apiSettings.namespace + path);
    return url;
    };})(jQuery);
    (function (){
    if(typeof window.CustomEvent==="function") return false;
    function CustomEvent(event, params){
    params=params||{ bubbles: false, cancelable: false, detail: undefined };
    var evt=document.createEvent('CustomEvent');
    evt.initCustomEvent(event,
    params.bubbles, params.cancelable, params.detail);
    return evt;
    }
    CustomEvent.prototype=window.Event.prototype;
    window.CustomEvent=CustomEvent;
    })();
    !function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.mdc=t():e.mdc=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="/assets/",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}Object.defineProperty(t,"__esModule",{value:!0}),t.autoInit=t.select=t.menu=t.textfield=t.drawer=t.snackbar=t.ripple=t.radio=t.iconToggle=t.checkbox=t.base=void 0;var o=n(1),a=i(o),s=n(12),u=i(s),c=n(19),l=i(c),d=n(24),f=i(d),_=n(2),p=i(_),h=n(13),v=i(h),y=n(33),m=i(y),g=n(31),b=i(g),C=n(6),O=i(C),T=n(28),E=i(T),A=n(8),I=r(A);I.default.register("MDCCheckbox",u.MDCCheckbox),I.default.register("MDCTemporaryDrawer",v.MDCTemporaryDrawer),I.default.register("MDCRipple",p.MDCRipple),I.default.register("MDCIconToggle",l.MDCIconToggle),I.default.register("MDCRadio",f.MDCRadio),I.default.register("MDCSnackbar",b.MDCSnackbar),I.default.register("MDCTextfield",m.MDCTextfield),I.default.register("MDCSimpleMenu",O.MDCSimpleMenu),I.default.register("MDCSelect",E.MDCSelect),t.base=a,t.checkbox=u,t.iconToggle=l,t.radio=f,t.ripple=p,t.snackbar=b,t.drawer=v,t.textfield=m,t.menu=O,t.select=E,t.autoInit=I.default},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(5);Object.defineProperty(t,"MDCFoundation",{enumerable:!0,get:function(){return r(i).default}});var o=n(9);Object.defineProperty(t,"MDCComponent",{enumerable:!0,get:function(){return r(o).default}})},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCRipple=t.MDCRippleFoundation=void 0;var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(26),l=r(c),d=n(4),f=(0,d.getMatchesProperty)(HTMLElement.prototype);t.MDCRippleFoundation=l.default;t.MDCRipple=function(e){function t(){return i(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return a(t,e),s(t,[{key:"getDefaultFoundation",value:function(){return new l.default(t.createAdapter(this))}},{key:"initialSyncWithDOM",value:function(){this.unbounded="mdcRippleIsUnbounded"in this.root_.dataset}},{key:"unbounded",get:function(){return this.unbounded_},set:function(e){var t=l.default.cssClasses.UNBOUNDED;this.unbounded_=Boolean(e),this.unbounded_?this.root_.classList.add(t):this.root_.classList.remove(t)}}],[{key:"attachTo",value:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=n.isUnbounded,i=void 0===r?void 0:r,o=new t(e);return void 0!==i&&(o.unbounded=i),o}},{key:"createAdapter",value:function(e){return{browserSupportsCssVars:function(){return(0,d.supportsCssVariables)(window)},isUnbounded:function(){return e.unbounded},isSurfaceActive:function(){return e.root_[f](":active")},addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},registerInteractionHandler:function(t,n){return e.root_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.root_.removeEventListener(t,n)},registerResizeHandler:function(e){return window.addEventListener("resize",e)},deregisterResizeHandler:function(e){return window.removeEventListener("resize",e)},updateCssVariable:function(t,n){return e.root_.style.setProperty(t,n)},computeBoundingRect:function(){return e.root_.getBoundingClientRect()},getWindowPageOffset:function(){return{x:window.pageXOffset,y:window.pageYOffset}}}}}]),t}(u.MDCComponent)},function(e,t){"use strict";function n(e){return void 0!==e.document&&"function"==typeof e.document.createElement}function r(e){return e in u||e in c}function i(e,t,n){switch(e){case"animationstart":case"animationend":case"animationiteration":return"animation"in n.style?t[e].noPrefix:t[e].webkitPrefix;case"transitionend":return"transition"in n.style?t[e].noPrefix:t[e].webkitPrefix;default:return t[e].noPrefix}}function o(e,t){if(!n(e)||!r(t))return t;var o=t in u?u:c,a=e.document.createElement("div"),s="";return s=o===u?i(t,o,a):o[t].noPrefix in a.style?o[t].noPrefix:o[t].webkitPrefix}function a(e,t){return o(e,t)}function s(e,t){return o(e,t)}Object.defineProperty(t,"__esModule",{value:!0}),t.getCorrectEventName=a,t.getCorrectPropertyName=s;var u={animationstart:{noPrefix:"animationstart",webkitPrefix:"webkitAnimationStart"},animationend:{noPrefix:"animationend",webkitPrefix:"webkitAnimationEnd"},animationiteration:{noPrefix:"animationiteration",webkitPrefix:"webkitAnimationIteration"},transitionend:{noPrefix:"transitionend",webkitPrefix:"webkitTransitionEnd"}},c={animation:{noPrefix:"animation",webkitPrefix:"-webkit-animation"},transform:{noPrefix:"transform",webkitPrefix:"-webkit-transform"},transition:{noPrefix:"transition",webkitPrefix:"-webkit-transition"}}},function(e,t){"use strict";function n(e){var t=e.CSS&&"function"==typeof e.CSS.supports;if(t){var n=e.CSS.supports("--css-vars","yes"),r=e.CSS.supports("(--css-vars: yes)")&&e.CSS.supports("color","#00000000");return n||r}}function r(e){return["webkitMatchesSelector","msMatchesSelector","matches"].filter(function(t){return t in e}).pop()}function i(e,t,n){var r=!1,i=function i(){r||(r=!0,e.removeClass(t),e.deregisterInteractionHandler(n,i))};return e.registerInteractionHandler(n,i),e.addClass(t),i}function o(e,t,n){var r=t.x,i=t.y,o=r+n.left,a=i+n.top,s=void 0,u=void 0;return"touchend"===e.type?(s=e.changedTouches[0].pageX-o,u=e.changedTouches[0].pageY-a):(s=e.pageX-o,u=e.pageY-a),{x:s,y:u}}Object.defineProperty(t,"__esModule",{value:!0}),t.supportsCssVariables=n,t.getMatchesProperty=r,t.animateWithClass=i,t.getNormalizedEventCoords=o},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};n(this,e),this.adapter_=t}return r(e,null,[{key:"cssClasses",get:function(){return{}}},{key:"strings",get:function(){return{}}},{key:"numbers",get:function(){return{}}},{key:"defaultAdapter",get:function(){return{}}}]),r(e,[{key:"init",value:function(){}},{key:"destroy",value:function(){}}]),e}();t.default=i},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(22);Object.defineProperty(t,"MDCSimpleMenu",{enumerable:!0,get:function(){return r.MDCSimpleMenu}}),Object.defineProperty(t,"MDCSimpleMenuFoundation",{enumerable:!0,get:function(){return r.MDCSimpleMenuFoundation}})},function(e,t){"use strict";function n(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(void 0===s||t){var n=e.document.createElement("div"),r="transform"in n.style?"transform":"webkitTransform";s=r}return s}function r(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return Math.min(n,Math.max(t,e))}function i(e,t,n,r,i){return o(a(e,t,r),n,i)}function o(e,t,n){if(0===e||1===e)return e;var r=e*t,i=t+e*(n-t),o=n+e*(1-n);return r+=e*(i-r),i+=e*(o-i),r+e*(i-r)}function a(e,t,n){var r=1e-6,i=8;if(e<=0)return 0;if(e>=1)return 1;for(var a=e,s=0,u=1,c=0,l=0;l<i;l++){c=o(a,t,n);var d=(o(a+r,t,n)-c)/r;if(Math.abs(c-e)<r)return a;if(Math.abs(d)<r)break;c<e?s=a:u=a,a-=(c-e)/d}for(var f=0;Math.abs(c-e)>r&&f<i;f++)c<e?(s=a,a=(a+u)/2):(u=a,a=(a+s)/2),c=o(a,t,n);return a}Object.defineProperty(t,"__esModule",{value:!0}),t.getTransformPropertyName=n,t.clamp=r,t.bezierProgress=i;var s=void 0},function(e,t){"use strict";function n(){for(var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:document,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:i,o=t.querySelectorAll("[data-mdc-auto-init]"),a=0;e=o[a];a++){var s=e.dataset.mdcAutoInit;if(!s)throw new Error("(mdc-auto-init) Constructor name must be given.");var u=r[s];if("function"!=typeof u)throw new Error("(mdc-auto-init) Could not find constructor in registry for "+s);if(e[s])n("(mdc-auto-init) Component already initialized for "+e+". Skipping...");else{var c=u.attachTo(e);Object.defineProperty(e,s,{value:c,writable:!1,enumerable:!1,configurable:!0})}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=n;var r=Object.create(null),i=console.warn.bind(console);n.register=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i;if("function"!=typeof t)throw new Error("(mdc-auto-init) Invalid Ctor value "+t+". Expected function");r[e]&&n("(mdc-auto-init) Overriding registration for "+e+" with "+t+". Was: "+r[e]),r[e]=t},n.deregister=function(e){delete r[e]},n.deregisterAll=function(){Object.keys(r).forEach(this.deregister,this)}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(5),s=r(a),u=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getDefaultFoundation();i(this,e),this.root_=t;for(var r=arguments.length,o=Array(r>2?r-2:0),a=2;a<r;a++)o[a-2]=arguments[a];this.initialize.apply(this,o),this.foundation_=n,this.foundation_.init(),this.initialSyncWithDOM()}return o(e,null,[{key:"attachTo",value:function(t){return new e(t,new s.default)}}]),o(e,[{key:"initialize",value:function(){}},{key:"getDefaultFoundation",value:function(){throw new Error("Subclasses must override getDefaultFoundation to return a properly configured foundation class")}},{key:"initialSyncWithDOM",value:function(){}},{key:"destroy",value:function(){this.foundation_.destroy()}},{key:"listen",value:function(e,t){this.root_.addEventListener(e,t)}},{key:"unlisten",value:function(e,t){this.root_.removeEventListener(e,t)}},{key:"emit",value:function(e,t){var n=void 0;"function"==typeof CustomEvent?n=new CustomEvent(e,{detail:t}):(n=document.createEvent("CustomEvent"),n.initCustomEvent(e,!1,!1,t)),this.root_.dispatchEvent(n)}}]),e}();t.default=u},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n="mdc-checkbox",r=n+"--anim";t.cssClasses={ROOT:n,CHECKED:n+"--checked",INDETERMINATE:n+"--indeterminate",ANIM_UNCHECKED_CHECKED:r+"-unchecked-checked",ANIM_UNCHECKED_INDETERMINATE:r+"-unchecked-indeterminate",ANIM_CHECKED_UNCHECKED:r+"-checked-unchecked",ANIM_CHECKED_INDETERMINATE:r+"-checked-indeterminate",ANIM_INDETERMINATE_CHECKED:r+"-indeterminate-checked",ANIM_INDETERMINATE_UNCHECKED:r+"-indeterminate-unchecked"},t.strings={NATIVE_CONTROL_SELECTOR:"."+n+"__native-control",TRANSITION_STATE_INIT:"init",TRANSITION_STATE_CHECKED:"checked",TRANSITION_STATE_UNCHECKED:"unchecked",TRANSITION_STATE_INDETERMINATE:"indeterminate"},t.numbers={ANIM_END_LATCH_MS:100}},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){return e&&"function"==typeof e.set}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),l=n(10),d=["checked","indeterminate"],f=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,s(t.defaultAdapter,e)));return n.currentCheckState_=l.strings.TRANSITION_STATE_INIT,n.currentAnimationClass_="",n.animEndLatchTimer_=0,n.animEndHandler_=function(){clearTimeout(n.animEndLatchTimer_),n.animEndLatchTimer_=setTimeout(function(){n.adapter_.removeClass(n.currentAnimationClass_),n.adapter_.deregisterAnimationEndHandler(n.animEndHandler_)},l.numbers.ANIM_END_LATCH_MS)},n.changeHandler_=function(){return n.transitionCheckState_()},n}return o(t,e),u(t,null,[{key:"cssClasses",get:function(){return l.cssClasses}},{key:"strings",get:function(){return l.strings}},{key:"numbers",get:function(){return l.numbers}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},registerAnimationEndHandler:function(){},deregisterAnimationEndHandler:function(){},registerChangeHandler:function(){},deregisterChangeHandler:function(){},getNativeControl:function(){},forceLayout:function(){},isAttachedToDOM:function(){}}}}]),u(t,[{key:"init",value:function(){this.adapter_.registerChangeHandler(this.changeHandler_),this.installPropertyChangeHooks_()}},{key:"destroy",value:function(){this.adapter_.deregisterChangeHandler(this.changeHandler_),this.uninstallPropertyChangeHooks_()}},{key:"isChecked",value:function(){return this.getNativeControl_().checked}},{key:"setChecked",value:function(e){this.getNativeControl_().checked=e}},{key:"isIndeterminate",value:function(){return this.getNativeControl_().indeterminate}},{key:"setIndeterminate",value:function(e){this.getNativeControl_().indeterminate=e}},{key:"isDisabled",value:function(){return this.getNativeControl_().disabled}},{key:"setDisabled",value:function(e){this.getNativeControl_().disabled=e}},{key:"installPropertyChangeHooks_",value:function(){var e=this,t=this.getNativeControl_(),n=Object.getPrototypeOf(t);d.forEach(function(r){var i=Object.getOwnPropertyDescriptor(n,r);a(i)&&Object.defineProperty(t,r,{get:i.get,set:function(n){i.set.call(t,n),e.transitionCheckState_()},configurable:i.configurable,enumerable:i.enumerable})})}},{key:"uninstallPropertyChangeHooks_",value:function(){var e=this.getNativeControl_(),t=Object.getPrototypeOf(e);d.forEach(function(n){var r=Object.getOwnPropertyDescriptor(t,n);a(r)&&Object.defineProperty(e,n,r)})}},{key:"transitionCheckState_",value:function(){var e=this.adapter_.getNativeControl();if(e){var t=this.currentCheckState_,n=this.determineCheckState_(e);t!==n&&(this.currentAnimationClass_.length>0&&(clearTimeout(this.animEndLatchTimer_),this.adapter_.forceLayout(),this.adapter_.removeClass(this.currentAnimationClass_)),this.currentAnimationClass_=this.getTransitionAnimationClass_(t,n),this.currentCheckState_=n,this.adapter_.isAttachedToDOM()&&this.currentAnimationClass_.length>0&&(this.adapter_.addClass(this.currentAnimationClass_),this.adapter_.registerAnimationEndHandler(this.animEndHandler_)))}}},{key:"determineCheckState_",value:function(e){var t=l.strings.TRANSITION_STATE_INDETERMINATE,n=l.strings.TRANSITION_STATE_CHECKED,r=l.strings.TRANSITION_STATE_UNCHECKED;return e.indeterminate?t:e.checked?n:r}},{key:"getTransitionAnimationClass_",value:function(e,n){var r=l.strings.TRANSITION_STATE_INIT,i=l.strings.TRANSITION_STATE_CHECKED,o=l.strings.TRANSITION_STATE_UNCHECKED,a=t.cssClasses,s=a.ANIM_UNCHECKED_CHECKED,u=a.ANIM_UNCHECKED_INDETERMINATE,c=a.ANIM_CHECKED_UNCHECKED,d=a.ANIM_CHECKED_INDETERMINATE,f=a.ANIM_INDETERMINATE_CHECKED,_=a.ANIM_INDETERMINATE_UNCHECKED;switch(e){case r:if(n===o)return"";case o:return n===i?s:u;case i:return n===o?c:d;default:return n===i?f:_}}},{key:"getNativeControl_",value:function(){return this.adapter_.getNativeControl()||{checked:!1,indeterminate:!1,disabled:!1}}}]),t}(c.MDCFoundation);t.default=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCCheckbox=t.MDCCheckboxFoundation=void 0;var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function e(t,n,r){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var o=Object.getPrototypeOf(t);return null===o?void 0:e(o,n,r)}if("value"in i)return i.value;var a=i.get;if(void 0!==a)return a.call(r)},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(1),d=n(2),f=n(4),_=n(3),p=n(11),h=r(p);t.MDCCheckboxFoundation=h.default;t.MDCCheckbox=function(e){function t(){var e;i(this,t);for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var s=o(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(r)));return s.ripple_=s.initRipple_(),s}return a(t,e),c(t,[{key:"nativeCb_",get:function(){var e=h.default.strings.NATIVE_CONTROL_SELECTOR;return this.root_.querySelector(e)}}],[{key:"attachTo",value:function(e){return new t(e)}}]),c(t,[{key:"initRipple_",value:function(){var e=this,t=(0,f.getMatchesProperty)(HTMLElement.prototype),n=s(d.MDCRipple.createAdapter(this),{isUnbounded:function(){return!0},isSurfaceActive:function(){return e.nativeCb_[t](":active")},registerInteractionHandler:function(t,n){return e.nativeCb_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.nativeCb_.removeEventListener(t,n)},computeBoundingRect:function(){var t=e.root_.getBoundingClientRect(),n=t.left,r=t.top,i=40;return{top:r,left:n,right:n+i,bottom:r+i,width:i,height:i}}}),r=new d.MDCRippleFoundation(n);return new d.MDCRipple(this.root_,r)}},{key:"getDefaultFoundation",value:function(){var e=this;return new h.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},registerAnimationEndHandler:function(t){return e.root_.addEventListener((0,_.getCorrectEventName)(window,"animationend"),t)},deregisterAnimationEndHandler:function(t){return e.root_.removeEventListener((0,_.getCorrectEventName)(window,"animationend"),t)},registerChangeHandler:function(t){return e.nativeCb_.addEventListener("change",t)},deregisterChangeHandler:function(t){return e.nativeCb_.removeEventListener("change",t)},getNativeControl:function(){return e.nativeCb_},forceLayout:function(){return e.root_.offsetWidth},isAttachedToDOM:function(){return Boolean(e.root_.parentNode)}})}},{key:"destroy",value:function(){this.ripple_.destroy(),u(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"destroy",this).call(this)}},{key:"checked",get:function(){return this.foundation_.isChecked()},set:function(e){this.foundation_.setChecked(e)}},{key:"indeterminate",get:function(){return this.foundation_.isIndeterminate()},set:function(e){this.foundation_.setIndeterminate(e)}},{key:"disabled",get:function(){return this.foundation_.isDisabled()},set:function(e){this.foundation_.setDisabled(e)}}]),t}(l.MDCComponent)},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(16);Object.defineProperty(t,"MDCTemporaryDrawer",{enumerable:!0,get:function(){return r.MDCTemporaryDrawer}}),Object.defineProperty(t,"MDCTemporaryDrawerFoundation",{enumerable:!0,get:function(){return r.MDCTemporaryDrawerFoundation}})},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n="mdc-temporary-drawer";t.cssClasses={ROOT:n,OPEN:n+"--open",ANIMATING:n+"--animating",RIGHT:n+"--right"},t.strings={DRAWER_SELECTOR:"."+n+"__drawer",OPACITY_VAR_NAME:"--"+n+"-opacity",FOCUSABLE_ELEMENTS:"a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]"}},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(14),l=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a(t.defaultAdapter,e)));return n.transitionEndHandler_=function(e){n.adapter_.isDrawer(e.target)&&(n.adapter_.removeClass(t.cssClasses.ANIMATING),n.adapter_.deregisterTransitionEndHandler(n.transitionEndHandler_))},n.inert_=!1,n.componentClickHandler_=function(){return n.close()},n.drawerClickHandler_=function(e){return e.stopPropagation()},n.componentTouchStartHandler_=function(e){return n.handleTouchStart_(e)},n.componentTouchMoveHandler_=function(e){return n.handleTouchMove_(e)},n.componentTouchEndHandler_=function(e){return n.handleTouchEnd_(e)},n.documentKeydownHandler_=function(e){(e.key&&"Escape"===e.key||27===e.keyCode)&&n.close()},n}return o(t,e),s(t,null,[{key:"cssClasses",get:function(){return c.cssClasses}},{key:"strings",get:function(){return c.strings}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},hasClass:function(){},hasNecessaryDom:function(){return!1},registerInteractionHandler:function(){},deregisterInteractionHandler:function(){},registerDrawerInteractionHandler:function(){},deregisterDrawerInteractionHandler:function(){},registerTransitionEndHandler:function(){},deregisterTransitionEndHandler:function(){},registerDocumentKeydownHandler:function(){},deregisterDocumentKeydownHandler:function(){},setTranslateX:function(){},updateCssVariable:function(){},getFocusableElements:function(){},saveElementTabState:function(){},restoreElementTabState:function(){},makeElementUntabbable:function(){},isRtl:function(){return!1},getDrawerWidth:function(){return 0},isDrawer:function(){return!1}}}}]),s(t,[{key:"init",value:function(){var e=t.cssClasses,n=e.ROOT,r=e.OPEN;if(!this.adapter_.hasClass(n))throw new Error(n+" class required in root element.");if(!this.adapter_.hasNecessaryDom())throw new Error("Required DOM nodes missing in "+n+" component.");this.adapter_.hasClass(r)?this.isOpen_=!0:(this.detabinate_(),this.isOpen_=!1),this.adapter_.updateCssVariable(0),this.adapter_.registerInteractionHandler("click",this.componentClickHandler_),this.adapter_.registerDrawerInteractionHandler("click",this.drawerClickHandler_),this.adapter_.registerDrawerInteractionHandler("touchstart",this.componentTouchStartHandler_),this.adapter_.registerInteractionHandler("touchmove",this.componentTouchMoveHandler_),this.adapter_.registerInteractionHandler("touchend",this.componentTouchEndHandler_)}},{key:"destroy",value:function(){this.adapter_.deregisterInteractionHandler("click",this.componentClickHandler_),this.adapter_.deregisterDrawerInteractionHandler("click",this.drawerClickHandler_),this.adapter_.deregisterDrawerInteractionHandler("touchstart",this.componentTouchStartHandler_),this.adapter_.deregisterInteractionHandler("touchmove",this.componentTouchMoveHandler_),this.adapter_.deregisterInteractionHandler("touchend",this.componentTouchEndHandler_),this.adapter_.deregisterDocumentKeydownHandler(this.documentKeydownHandler_)}},{key:"open",value:function(){this.adapter_.updateCssVariable(""),this.adapter_.registerTransitionEndHandler(this.transitionEndHandler_),this.adapter_.registerDocumentKeydownHandler(this.documentKeydownHandler_),this.adapter_.addClass(t.cssClasses.ANIMATING),this.adapter_.addClass(t.cssClasses.OPEN),this.retabinate_(),this.isOpen_=!0}},{key:"close",value:function(){this.adapter_.updateCssVariable(""),this.adapter_.deregisterDocumentKeydownHandler(this.documentKeydownHandler_),this.adapter_.registerTransitionEndHandler(this.transitionEndHandler_),this.adapter_.addClass(t.cssClasses.ANIMATING),this.adapter_.removeClass(t.cssClasses.OPEN),this.detabinate_(),this.isOpen_=!1}},{key:"isOpen",value:function(){return this.isOpen_}},{key:"detabinate_",value:function(){if(!this.inert_){var e=this.adapter_.getFocusableElements();if(e)for(var t=0;t<e.length;t++)this.adapter_.saveElementTabState(e[t]),this.adapter_.makeElementUntabbable(e[t]);this.inert_=!0}}},{key:"retabinate_",value:function(){if(this.inert_){var e=this.adapter_.getFocusableElements();if(e)for(var t=0;t<e.length;t++)this.adapter_.restoreElementTabState(e[t]);this.inert_=!1}}},{key:"handleTouchStart_",value:function(e){this.adapter_.hasClass(t.cssClasses.OPEN)&&(e.pointerType&&"touch"!==e.pointerType||(this.direction_=this.adapter_.isRtl()?-1:1,this.drawerWidth_=this.adapter_.getDrawerWidth(),this.startX_=e.touches?e.touches[0].pageX:e.pageX,this.currentX_=this.startX_,this.touchingSideNav_=!0,requestAnimationFrame(this.updateDrawer_.bind(this))))}},{key:"handleTouchMove_",value:function(e){e.pointerType&&"touch"!==e.pointerType||(this.currentX_=e.touches?e.touches[0].pageX:e.pageX)}},{key:"handleTouchEnd_",value:function(e){if(!e.pointerType||"touch"===e.pointerType){this.touchingSideNav_=!1,this.adapter_.setTranslateX(null),this.adapter_.updateCssVariable("");var t=null;t=1===this.direction_?Math.min(0,this.currentX_-this.startX_):Math.max(0,this.currentX_-this.startX_),Math.abs(t/this.drawerWidth_)>=.5?this.close():this.open()}}},{key:"updateDrawer_",value:function(){if(this.touchingSideNav_){requestAnimationFrame(this.updateDrawer_.bind(this));var e=null,t=null;e=1===this.direction_?Math.min(0,this.currentX_-this.startX_):Math.max(0,this.currentX_-this.startX_),t=Math.max(0,1+this.direction_*(e/this.drawerWidth_)),this.adapter_.setTranslateX(e),this.adapter_.updateCssVariable(t)}}}]),t}(u.MDCFoundation);t.default=l},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCTemporaryDrawer=t.MDCTemporaryDrawerFoundation=void 0;var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),l=n(15),d=i(l),f=n(17),_=r(f);t.MDCTemporaryDrawerFoundation=d.default;t.MDCTemporaryDrawer=function(e){function t(){return o(this,t),a(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return s(t,e),u(t,[{key:"getDefaultFoundation",value:function(){var e=this,t=d.default.strings,n=t.FOCUSABLE_ELEMENTS,r=t.OPACITY_VAR_NAME;return new d.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},hasClass:function(t){return e.root_.classList.contains(t)},hasNecessaryDom:function(){return Boolean(e.drawer)},registerInteractionHandler:function(t,n){return e.root_.addEventListener(_.remapEvent(t),n,_.applyPassive())},deregisterInteractionHandler:function(t,n){return e.root_.removeEventListener(_.remapEvent(t),n,_.applyPassive())},registerDrawerInteractionHandler:function(t,n){return e.drawer.addEventListener(_.remapEvent(t),n)},deregisterDrawerInteractionHandler:function(t,n){return e.drawer.removeEventListener(_.remapEvent(t),n)},registerTransitionEndHandler:function(t){return e.drawer.addEventListener("transitionend",t)},deregisterTransitionEndHandler:function(t){return e.drawer.removeEventListener("transitionend",t)},registerDocumentKeydownHandler:function(e){return document.addEventListener("keydown",e)},deregisterDocumentKeydownHandler:function(e){return document.removeEventListener("keydown",e)},getDrawerWidth:function(){return e.drawer.offsetWidth},setTranslateX:function(t){return e.drawer.style.setProperty(_.getTransformPropertyName(),null===t?null:"translateX("+t+"px)")},updateCssVariable:function(t){_.supportsCssCustomProperties()&&e.root_.style.setProperty(r,t)},getFocusableElements:function(){return e.drawer.querySelectorAll(n)},saveElementTabState:function(e){return _.saveElementTabState(e)},restoreElementTabState:function(e){return _.restoreElementTabState(e)},makeElementUntabbable:function(e){return e.setAttribute("tabindex",-1)},isRtl:function(){return"rtl"===getComputedStyle(e.root_).getPropertyValue("direction")},isDrawer:function(t){return t===e.drawer}})}},{key:"open",get:function(){return this.foundation_.isOpen()},set:function(e){e?this.foundation_.open():this.foundation_.close()}},{key:"drawer",get:function(){return this.root_.querySelector(d.default.strings.DRAWER_SELECTOR)}}],[{key:"attachTo",value:function(e){return new t(e);
    }}]),t}(c.MDCComponent)},function(e,t){"use strict";function n(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window;if(!("ontouchstart"in t.document))switch(e){case"touchstart":return"pointerdown";case"touchmove":return"pointermove";case"touchend":return"pointerup";default:return e}return e}function r(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(void 0===l||t){var n=e.document.createElement("div"),r="transform"in n.style?"transform":"-webkit-transform";l=r}return l}function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window;return"CSS"in e&&e.CSS.supports("(--color: red)")}function o(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(void 0===d||t){var n=!1;try{e.document.addEventListener("test",null,{get passive(){n=!0}})}catch(e){}d=n}return!!d&&{passive:!0}}function a(e){e.hasAttribute("tabindex")&&e.setAttribute(u,e.getAttribute("tabindex")),e.setAttribute(c,!0)}function s(e){e.hasAttribute(c)&&(e.hasAttribute(u)?(e.setAttribute("tabindex",e.getAttribute(u)),e.removeAttribute(u)):e.removeAttribute("tabindex"),e.removeAttribute(c))}Object.defineProperty(t,"__esModule",{value:!0}),t.remapEvent=n,t.getTransformPropertyName=r,t.supportsCssCustomProperties=i,t.applyPassive=o,t.saveElementTabState=a,t.restoreElementTabState=s;var u="data-mdc-tabindex",c="data-mdc-tabindex-handled",l=void 0,d=void 0},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){var t=e.key,n=e.keyCode;return t&&"Space"===t||32===n}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),l="mdc-icon-toggle",d=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,s(t.defaultAdapter,e)));return n.on_=!1,n.disabled_=!1,n.savedTabIndex_=-1,n.toggleOnData_=null,n.toggleOffData_=null,n.clickHandler_=function(){return n.toggleFromEvt_()},n.isHandlingKeydown_=!1,n.keydownHandler_=function(e){if(a(e))return n.isHandlingKeydown_=!0,e.preventDefault()},n.keyupHandler_=function(e){a(e)&&(n.isHandlingKeydown_=!1,n.toggleFromEvt_())},n}return o(t,e),u(t,null,[{key:"cssClasses",get:function(){return{ROOT:l,DISABLED:l+"--disabled"}}},{key:"strings",get:function(){return{DATA_TOGGLE_ON:"data-toggle-on",DATA_TOGGLE_OFF:"data-toggle-off",ARIA_PRESSED:"aria-pressed",ARIA_DISABLED:"aria-disabled",ARIA_LABEL:"aria-label"}}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},registerInteractionHandler:function(){},deregisterInteractionHandler:function(){},setText:function(){},getTabIndex:function(){return 0},setTabIndex:function(){},getAttr:function(){return""},setAttr:function(){},rmAttr:function(){},notifyChange:function(){}}}}]),u(t,[{key:"init",value:function(){this.refreshToggleData(),this.adapter_.registerInteractionHandler("click",this.clickHandler_),this.adapter_.registerInteractionHandler("keydown",this.keydownHandler_),this.adapter_.registerInteractionHandler("keyup",this.keyupHandler_)}},{key:"refreshToggleData",value:function(){var e=t.strings,n=e.DATA_TOGGLE_ON,r=e.DATA_TOGGLE_OFF;this.toggleOnData_=this.parseJsonDataAttr_(n),this.toggleOffData_=this.parseJsonDataAttr_(r)}},{key:"destroy",value:function(){this.adapter_.deregisterInteractionHandler("click",this.clickHandler_),this.adapter_.deregisterInteractionHandler("keydown",this.keydownHandler_),this.adapter_.deregisterInteractionHandler("keyup",this.keyupHandler_)}},{key:"toggleFromEvt_",value:function(){this.toggle();var e=this.on_;this.adapter_.notifyChange({isOn:e})}},{key:"isOn",value:function(){return this.on_}},{key:"toggle",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:!this.on_;this.on_=e;var n=t.strings,r=n.ARIA_LABEL,i=n.ARIA_PRESSED,o=this.on_?this.toggleOnData_:this.toggleOffData_,a=o.content,s=o.label,u=o.cssClass,c=this.on_?this.toggleOffData_:this.toggleOnData_,l=c.cssClass;this.on_?this.adapter_.setAttr(i,"true"):this.adapter_.setAttr(i,"false"),l&&this.adapter_.removeClass(l),u&&this.adapter_.addClass(u),a&&this.adapter_.setText(a),s&&this.adapter_.setAttr(r,s)}},{key:"parseJsonDataAttr_",value:function(e){var t=this.adapter_.getAttr(e);return t?JSON.parse(t):{}}},{key:"isDisabled",value:function(){return this.disabled_}},{key:"setDisabled",value:function(e){this.disabled_=e;var n=t.cssClasses.DISABLED,r=t.strings.ARIA_DISABLED;this.disabled_?(this.savedTabIndex=this.adapter_.getTabIndex(),this.adapter_.setTabIndex(-1),this.adapter_.setAttr(r,"true"),this.adapter_.addClass(n)):(this.adapter_.setTabIndex(this.savedTabIndex),this.adapter_.rmAttr(r),this.adapter_.removeClass(n))}},{key:"isKeyboardActivated",value:function(){return this.isHandlingKeydown_}}]),t}(c.MDCFoundation);t.default=d},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCIconToggle=t.MDCIconToggleFoundation=void 0;var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function e(t,n,r){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var o=Object.getPrototypeOf(t);return null===o?void 0:e(o,n,r)}if("value"in i)return i.value;var a=i.get;if(void 0!==a)return a.call(r)},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(1),d=n(2),f=n(18),_=r(f);t.MDCIconToggleFoundation=_.default;t.MDCIconToggle=function(e){function t(){var e;i(this,t);for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var s=o(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(r)));return s.ripple_=s.initRipple_(),s}return a(t,e),c(t,null,[{key:"attachTo",value:function(e){return new t(e)}}]),c(t,[{key:"initRipple_",value:function(){var e=this,t=s(d.MDCRipple.createAdapter(this),{isUnbounded:function(){return!0},isSurfaceActive:function(){return e.foundation_.isKeyboardActivated()},computeBoundingRect:function(){var t=48,n=e.root_.getBoundingClientRect(),r=n.left,i=n.top;return{left:r,top:i,width:t,height:t,right:r+t,bottom:r+t}}}),n=new d.MDCRippleFoundation(t);return new d.MDCRipple(this.root_,n)}},{key:"destroy",value:function(){this.ripple_.destroy(),u(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"destroy",this).call(this)}},{key:"getDefaultFoundation",value:function(){var e=this;return new _.default({addClass:function(t){return e.iconEl_.classList.add(t)},removeClass:function(t){return e.iconEl_.classList.remove(t)},registerInteractionHandler:function(t,n){return e.root_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.root_.removeEventListener(t,n)},setText:function(t){e.iconEl_.textContent=t},getTabIndex:function(){return e.root_.tabIndex},setTabIndex:function(t){e.root_.tabIndex=t},getAttr:function(t,n){return e.root_.getAttribute(t,n)},setAttr:function(t,n){return e.root_.setAttribute(t,n)},rmAttr:function(t){return e.root_.removeAttribute(t)},notifyChange:function(t){return e.emit("MDCIconToggle:change",t)}})}},{key:"initialSyncWithDOM",value:function(){this.on="true"===this.root_.getAttribute(_.default.strings.ARIA_PRESSED),this.disabled="true"===this.root_.getAttribute(_.default.strings.ARIA_DISABLED)}},{key:"refreshToggleData",value:function(){this.foundation_.refreshToggleData()}},{key:"iconEl_",get:function(){var e=this.root_.dataset.iconInnerSelector;return e?this.root_.querySelector(e):this.root_}},{key:"on",get:function(){return this.foundation_.isOn()},set:function(e){this.foundation_.toggle(e)}},{key:"disabled",get:function(){return this.foundation_.isDisabled()},set:function(e){this.foundation_.setDisabled(e)}}]),t}(l.MDCComponent)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n="mdc-simple-menu";t.cssClasses={ROOT:n,OPEN:n+"--open",ANIMATING:n+"--animating",TOP_RIGHT:n+"--open-from-top-right",BOTTOM_LEFT:n+"--open-from-bottom-left",BOTTOM_RIGHT:n+"--open-from-bottom-right"},t.strings={ITEMS_SELECTOR:"."+n+"__items"},t.numbers={SELECTED_TRIGGER_DELAY:50,TRANSITION_DURATION_MS:300,TRANSITION_SCALE_ADJUSTMENT_X:.5,TRANSITION_SCALE_ADJUSTMENT_Y:.2,TRANSITION_X1:0,TRANSITION_Y1:0,TRANSITION_X2:.2,TRANSITION_Y2:1}},function(e,t,n){"use strict";function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),l=n(20),d=n(7),f=function(e){function t(e){i(this,t);var n=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,s(t.defaultAdapter,e)));return n.clickHandler_=function(e){return n.handlePossibleSelected_(e)},n.keydownHandler_=function(e){return n.handleKeyboardDown_(e)},n.keyupHandler_=function(e){return n.handleKeyboardUp_(e)},n.documentClickHandler_=function(e){n.adapter_.notifyCancel(),n.close()},n.isOpen_=!1,n.startScaleX_=0,n.startScaleY_=0,n.targetScale_=1,n.scaleX_=0,n.scaleY_=0,n.running_=!1,n.selectedTriggerTimerId_=0,n.animationRequestId_=0,n}return a(t,e),u(t,null,[{key:"cssClasses",get:function(){return l.cssClasses}},{key:"strings",get:function(){return l.strings}},{key:"numbers",get:function(){return l.numbers}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},hasClass:function(){},hasNecessaryDom:function(){return!1},getInnerDimensions:function(){return{}},hasAnchor:function(){return!1},getAnchorDimensions:function(){return{}},getWindowDimensions:function(){return{}},setScale:function(){},setInnerScale:function(){},getNumberOfItems:function(){return 0},registerInteractionHandler:function(){},deregisterInteractionHandler:function(){},registerDocumentClickHandler:function(){},deregisterDocumentClickHandler:function(){},getYParamsForItemAtIndex:function(){return{}},setTransitionDelayForItemAtIndex:function(){},getIndexForEventTarget:function(){return 0},notifySelected:function(){},notifyCancel:function(){},saveFocus:function(){},restoreFocus:function(){},isFocused:function(){return!1},focus:function(){},getFocusedItemIndex:function(){return-1},focusItemAtIndex:function(){},isRtl:function(){return!1},setTransformOrigin:function(){},setPosition:function(){}}}}]),u(t,[{key:"init",value:function(){var e=t.cssClasses,n=e.ROOT,r=e.OPEN;if(!this.adapter_.hasClass(n))throw new Error(n+" class required in root element.");if(!this.adapter_.hasNecessaryDom())throw new Error("Required DOM nodes missing in "+n+" component.");this.adapter_.hasClass(r)&&(this.isOpen_=!0),this.adapter_.registerInteractionHandler("click",this.clickHandler_),this.adapter_.registerInteractionHandler("keyup",this.keyupHandler_),this.adapter_.registerInteractionHandler("keydown",this.keydownHandler_)}},{key:"destroy",value:function(){clearTimeout(this.selectedTriggerTimerId_),cancelAnimationFrame(this.animationRequestId_),this.adapter_.deregisterInteractionHandler("click",this.clickHandler_),this.adapter_.deregisterInteractionHandler("keyup",this.keyupHandler_),this.adapter_.deregisterInteractionHandler("keydown",this.keydownHandler_),this.adapter_.deregisterDocumentClickHandler(this.documentClickHandler_)}},{key:"applyTransitionDelays_",value:function(){for(var e=t.cssClasses,n=e.BOTTOM_LEFT,r=e.BOTTOM_RIGHT,i=this.adapter_.getNumberOfItems(),o=this.dimensions_.height,a=t.numbers.TRANSITION_DURATION_MS/1e3,s=t.numbers.TRANSITION_SCALE_ADJUSTMENT_Y,u=0;u<i;u++){var c=this.adapter_.getYParamsForItemAtIndex(u),l=c.top,d=c.height;this.itemHeight_=d;var f=l/o;(this.adapter_.hasClass(n)||this.adapter_.hasClass(r))&&(f=(o-l-d)/o);var _=(s+f*(1-s))*a;this.adapter_.setTransitionDelayForItemAtIndex(u,_.toFixed(3)+"s")}}},{key:"removeTransitionDelays_",value:function(){for(var e=this.adapter_.getNumberOfItems(),t=0;t<e;t++)this.adapter_.setTransitionDelayForItemAtIndex(t,null)}},{key:"animationLoop_",value:function(){var e=this,n=window.performance.now(),r=t.numbers,i=r.TRANSITION_DURATION_MS,o=r.TRANSITION_X1,a=r.TRANSITION_Y1,s=r.TRANSITION_X2,u=r.TRANSITION_Y2,c=r.TRANSITION_SCALE_ADJUSTMENT_X,l=r.TRANSITION_SCALE_ADJUSTMENT_Y,f=(0,d.clamp)((n-this.startTime_)/i),_=(0,d.clamp)((f-c)/(1-c)),p=f,h=this.startScaleY_;1===this.targetScale_&&(this.itemHeight_&&(h=Math.max(this.itemHeight_/this.dimensions_.height,h)),_=(0,d.clamp)(f+c),p=(0,d.clamp)((f-l)/(1-l)));var v=(0,d.bezierProgress)(_,o,a,s,u),y=(0,d.bezierProgress)(p,o,a,s,u);this.scaleX_=this.startScaleX_+(this.targetScale_-this.startScaleX_)*v;var m=1/(0===this.scaleX_?1:this.scaleX_);this.scaleY_=h+(this.targetScale_-h)*y;var g=1/(0===this.scaleY_?1:this.scaleY_);this.adapter_.setScale(this.scaleX_,this.scaleY_),this.adapter_.setInnerScale(m,g),f<1?this.animationRequestId_=requestAnimationFrame(function(){return e.animationLoop_()}):(this.animationRequestId_=0,this.running_=!1,this.adapter_.removeClass(t.cssClasses.ANIMATING))}},{key:"animateMenu_",value:function(){var e=this;this.startTime_=window.performance.now(),this.startScaleX_=this.scaleX_,this.startScaleY_=this.scaleY_,this.targetScale_=this.isOpen_?1:0,this.running_||(this.running_=!0,this.animationRequestId_=requestAnimationFrame(function(){return e.animationLoop_()}))}},{key:"focusOnOpen_",value:function(e){null===e?(this.adapter_.focus(),this.adapter_.isFocused()||this.adapter_.focusItemAtIndex(0)):this.adapter_.focusItemAtIndex(e)}},{key:"handleKeyboardDown_",value:function(e){if(e.altKey||e.ctrlKey||e.metaKey)return!0;var t=e.keyCode,n=e.key,r=e.shiftKey,i="Tab"===n||9===t,o="ArrowUp"===n||38===t,a="ArrowDown"===n||40===t,s="Space"===n||32===t,u=this.adapter_.getFocusedItemIndex(),c=this.adapter_.getNumberOfItems()-1;return r&&i&&0===u?(this.adapter_.focusItemAtIndex(c),e.preventDefault(),!1):!r&&i&&u===c?(this.adapter_.focusItemAtIndex(0),e.preventDefault(),!1):((o||a||s)&&e.preventDefault(),o?0===u||this.adapter_.isFocused()?this.adapter_.focusItemAtIndex(c):this.adapter_.focusItemAtIndex(u-1):a&&(u===c||this.adapter_.isFocused()?this.adapter_.focusItemAtIndex(0):this.adapter_.focusItemAtIndex(u+1)),!0)}},{key:"handleKeyboardUp_",value:function(e){if(e.altKey||e.ctrlKey||e.metaKey)return!0;var t=e.keyCode,n=e.key,r="Enter"===n||13===t,i="Space"===n||32===t,o="Escape"===n||27===t;return(r||i)&&this.handlePossibleSelected_(e),o&&(this.adapter_.notifyCancel(),this.close()),!0}},{key:"handlePossibleSelected_",value:function(e){var t=this,n=this.adapter_.getIndexForEventTarget(e.target);n<0||this.selectedTriggerTimerId_||(this.selectedTriggerTimerId_=setTimeout(function(){t.selectedTriggerTimerId_=0,t.close(),t.adapter_.notifySelected({index:n})},l.numbers.SELECTED_TRIGGER_DELAY))}},{key:"autoPosition_",value:function(){var e;if(this.adapter_.hasAnchor()){var t="top",n="left",i=this.adapter_.getAnchorDimensions(),o=this.adapter_.getWindowDimensions(),a=i.top+this.dimensions_.height-o.height,s=this.dimensions_.height-i.bottom,u=a>0;u&&s<a&&(t="bottom");var c=i.left+this.dimensions_.width-o.width,l=this.dimensions_.width-i.right,d=c>0,f=l>0;this.adapter_.isRtl()?(n="right",f&&c<l&&(n="left")):d&&l<c&&(n="right");var _=(e={},r(e,n,"0"),r(e,t,"0"),e);this.adapter_.setTransformOrigin(t+" "+n),this.adapter_.setPosition(_)}}},{key:"open",value:function(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=n.focusIndex,i=void 0===r?null:r;this.adapter_.saveFocus(),this.adapter_.addClass(t.cssClasses.ANIMATING),this.animationRequestId_=requestAnimationFrame(function(){e.dimensions_=e.adapter_.getInnerDimensions(),e.applyTransitionDelays_(),e.autoPosition_(),e.animateMenu_(),e.adapter_.addClass(t.cssClasses.OPEN),e.focusOnOpen_(i),e.adapter_.registerDocumentClickHandler(e.documentClickHandler_)}),this.isOpen_=!0}},{key:"close",value:function(){var e=this;this.adapter_.deregisterDocumentClickHandler(this.documentClickHandler_),this.adapter_.addClass(t.cssClasses.ANIMATING),requestAnimationFrame(function(){e.removeTransitionDelays_(),e.animateMenu_(),e.adapter_.removeClass(t.cssClasses.OPEN)}),this.isOpen_=!1,this.adapter_.restoreFocus()}},{key:"isOpen",value:function(){return this.isOpen_}}]),t}(c.MDCFoundation);t.default=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCSimpleMenu=t.MDCSimpleMenuFoundation=void 0;var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(21),l=r(c),d=n(7);t.MDCSimpleMenuFoundation=l.default;t.MDCSimpleMenu=function(e){function t(){return i(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return a(t,e),s(t,[{key:"show",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.focusIndex,n=void 0===t?null:t;this.foundation_.open({focusIndex:n})}},{key:"hide",value:function(){this.foundation_.close()}},{key:"getDefaultFoundation",value:function(){var e=this;return new l.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},hasClass:function(t){return e.root_.classList.contains(t)},hasNecessaryDom:function(){return Boolean(e.itemsContainer_)},getInnerDimensions:function(){var t=e.itemsContainer_;return{width:t.offsetWidth,height:t.offsetHeight}},hasAnchor:function(){return e.root_.parentElement&&e.root_.parentElement.classList.contains("mdc-menu-anchor")},getAnchorDimensions:function(){return e.root_.parentElement.getBoundingClientRect()},getWindowDimensions:function(){return{width:window.innerWidth,height:window.innerHeight}},setScale:function(t,n){e.root_.style[(0,d.getTransformPropertyName)(window)]="scale("+t+", "+n+")"},setInnerScale:function(t,n){e.itemsContainer_.style[(0,d.getTransformPropertyName)(window)]="scale("+t+", "+n+")"},getNumberOfItems:function(){return e.items.length},registerInteractionHandler:function(t,n){return e.root_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.root_.removeEventListener(t,n)},registerDocumentClickHandler:function(e){return document.addEventListener("click",e)},deregisterDocumentClickHandler:function(e){return document.removeEventListener("click",e)},getYParamsForItemAtIndex:function(t){var n=e.items[t],r=n.offsetTop,i=n.offsetHeight;return{top:r,height:i}},setTransitionDelayForItemAtIndex:function(t,n){return e.items[t].style.setProperty("transition-delay",n)},getIndexForEventTarget:function(t){return e.items.indexOf(t)},notifySelected:function(t){return e.emit("MDCSimpleMenu:selected",{index:t.index,item:e.items[t.index]})},notifyCancel:function(){return e.emit("MDCSimpleMenu:cancel")},saveFocus:function(){e.previousFocus_=document.activeElement},restoreFocus:function(){e.previousFocus_&&e.previousFocus_.focus()},isFocused:function(){return document.activeElement===e.root_},focus:function(){return e.root_.focus()},getFocusedItemIndex:function(){return e.items.indexOf(document.activeElement)},focusItemAtIndex:function(t){return e.items[t].focus()},isRtl:function(){return"rtl"===getComputedStyle(e.root_).getPropertyValue("direction")},setTransformOrigin:function(t){e.root_.style[(0,d.getTransformPropertyName)(window)+"-origin"]=t},setPosition:function(t){e.root_.style.left="left"in t?t.left:null,e.root_.style.right="right"in t?t.right:null,e.root_.style.top="top"in t?t.top:null,e.root_.style.bottom="bottom"in t?t.bottom:null}})}},{key:"open",get:function(){return this.foundation_.isOpen()},set:function(e){e?this.foundation_.open():this.foundation_.close()}},{key:"itemsContainer_",get:function(){return this.root_.querySelector(l.default.strings.ITEMS_SELECTOR)}},{key:"items",get:function(){var e=this.itemsContainer_;return[].slice.call(e.querySelectorAll(".mdc-list-item[role]"))}}],[{key:"attachTo",value:function(e){return new t(e)}}]),t}(u.MDCComponent)},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(1),u="mdc-radio",c=function(e){function t(){return r(this,t),i(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return o(t,e),a(t,[{key:"isChecked",value:function(){return this.getNativeControl_().checked}},{key:"setChecked",value:function(e){this.getNativeControl_().checked=e}},{key:"isDisabled",value:function(){return this.getNativeControl_().disabled}},{key:"setDisabled",value:function(e){var n=t.cssClasses.DISABLED;this.getNativeControl_().disabled=e,e?this.adapter_.addClass(n):this.adapter_.removeClass(n)}},{key:"getNativeControl_",value:function(){return this.adapter_.getNativeControl()||{checked:!1,disabled:!1}}}],[{key:"cssClasses",get:function(){return{ROOT:u,DISABLED:u+"--disabled"}}},{key:"strings",get:function(){return{NATIVE_CONTROL_SELECTOR:"."+u+"__native-control"}}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},getNativeControl:function(){}}}}]),t}(s.MDCFoundation);t.default=c},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCRadio=t.MDCRadioFoundation=void 0;var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function e(t,n,r){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var o=Object.getPrototypeOf(t);return null===o?void 0:e(o,n,r)}if("value"in i)return i.value;var a=i.get;if(void 0!==a)return a.call(r)},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(1),d=n(2),f=n(23),_=r(f);t.MDCRadioFoundation=_.default;t.MDCRadio=function(e){function t(){var e;i(this,t);for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var s=o(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(r)));return s.ripple_=s.initRipple_(),s}return a(t,e),c(t,[{key:"checked",get:function(){return this.foundation_.isChecked()},set:function(e){this.foundation_.setChecked(e)}},{key:"disabled",get:function(){return this.foundation_.isDisabled()},set:function(e){this.foundation_.setDisabled(e)}}],[{key:"attachTo",value:function(e){return new t(e)}}]),c(t,[{key:"initRipple_",value:function(){var e=this,t=s(d.MDCRipple.createAdapter(this),{isUnbounded:function(){return!0},isSurfaceActive:function(){return!1},registerInteractionHandler:function(t,n){return e.nativeControl_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.nativeControl_.removeEventListener(t,n)},computeBoundingRect:function(){var t=e.root_.getBoundingClientRect(),n=t.left,r=t.top,i=40;return{top:r,left:n,right:n+i,bottom:r+i,width:i,height:i}}}),n=new d.MDCRippleFoundation(t);return new d.MDCRipple(this.root_,n)}},{key:"destroy",value:function(){this.ripple_.destroy(),u(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"destroy",this).call(this)}},{key:"getDefaultFoundation",value:function(){var e=this;return new _.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},getNativeControl:function(){return e.root_.querySelector(_.default.strings.NATIVE_CONTROL_SELECTOR)}})}},{key:"nativeControl_",get:function(){return this.root_.querySelector(_.default.strings.NATIVE_CONTROL_SELECTOR)}}]),t}(l.MDCComponent)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=t.ROOT="mdc-ripple",r=t.UPGRADED=n+"-upgraded";t.cssClasses={ROOT:r,UNBOUNDED:r+"--unbounded",BG_ACTIVE:r+"--background-active",BG_BOUNDED_ACTIVE_FILL:r+"--background-bounded-active-fill",FG_BOUNDED_ACTIVE_FILL:r+"--foreground-bounded-active-fill",FG_UNBOUNDED_ACTIVATION:r+"--foreground-unbounded-activation",FG_UNBOUNDED_DEACTIVATION:r+"--foreground-unbounded-deactivation"},t.strings={VAR_SURFACE_WIDTH:"--"+n+"-surface-width",VAR_SURFACE_HEIGHT:"--"+n+"-surface-height",VAR_FG_SIZE:"--"+n+"-fg-size",VAR_FG_UNBOUNDED_OPACITY_DURATION:"--"+n+"-fg-unbounded-opacity-duration",VAR_FG_UNBOUNDED_TRANSFORM_DURATION:"--"+n+"-fg-unbounded-transform-duration",VAR_LEFT:"--"+n+"-left",VAR_TOP:"--"+n+"-top",VAR_TRANSLATE_END:"--"+n+"-translate-end",VAR_FG_APPROX_XF:"--"+n+"-fg-approx-xf",VAR_FG_SCALE:"--"+n+"-fg-scale",VAR_FG_TRANSLATE_START:"--"+n+"-fg-translate-start",VAR_FG_TRANSLATE_END:"--"+n+"-fg-translate-end"},t.numbers={FG_TRANSFORM_DELAY_MS:80,OPACITY_DURATION_DIVISOR:3,ACTIVE_OPACITY_DURATION_MS:110,MIN_OPACITY_DURATION_MS:200,UNBOUNDED_TRANSFORM_DURATION_MS:200,PADDING:10,INITIAL_ORIGIN_SCALE:.6}},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(3),l=n(25),d=n(4),f={mouseup:"mousedown",pointerup:"pointerdown",touchend:"touchstart",keyup:"keydown",blur:"focus"},_=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a(t.defaultAdapter,e)));return n.layoutFrame_=0,n.frame_={width:0,height:0},n.activationState_=n.defaultActivationState_(),n.xfDuration_=0,n.initialSize_=0,n.maxRadius_=0,n.listenerInfos_=[{activate:"touchstart",deactivate:"touchend"},{activate:"pointerdown",deactivate:"pointerup"},{activate:"mousedown",deactivate:"mouseup"},{activate:"keydown",deactivate:"keyup"},{focus:"focus",blur:"blur"}],n.listeners_={activate:function(e){return n.activate_(e)},deactivate:function(e){return n.deactivate_(e)},focus:function(){return requestAnimationFrame(function(){return n.adapter_.addClass(t.cssClasses.BG_ACTIVE)})},blur:function(){return requestAnimationFrame(function(){return n.adapter_.removeClass(t.cssClasses.BG_ACTIVE)})}},n.unboundedOpacityFadeTimer_=0,n.resizeHandler_=function(){return n.layout()},n.cancelBgBounded_=function(){},n.cancelFgBounded_=function(){},n.cancelFgUnbounded_=function(){},n.unboundedCoords_={left:0,top:0},n.fgScale_=0,n}return o(t,e),s(t,[{key:"isSupported_",get:function(){return this.adapter_.browserSupportsCssVars()}}],[{key:"cssClasses",get:function(){return l.cssClasses}},{key:"strings",get:function(){return l.strings}},{key:"numbers",get:function(){return l.numbers}},{key:"defaultAdapter",get:function(){return{
    browserSupportsCssVars:function(){},isUnbounded:function(){},isSurfaceActive:function(){},addClass:function(){},removeClass:function(){},registerInteractionHandler:function(){},deregisterInteractionHandler:function(){},registerResizeHandler:function(){},deregisterResizeHandler:function(){},updateCssVariable:function(){},computeBoundingRect:function(){},getWindowPageOffset:function(){}}}}]),s(t,[{key:"defaultActivationState_",value:function(){return{isActivated:!1,wasActivatedByPointer:!1,wasElementMadeActive:!1,activationStartTime:0,activationEvent:null}}},{key:"init",value:function(){var e=this;if(this.isSupported_){this.addEventListeners_();var n=t.cssClasses,r=n.ROOT,i=n.UNBOUNDED;requestAnimationFrame(function(){e.adapter_.addClass(r),e.adapter_.isUnbounded()&&e.adapter_.addClass(i),e.layoutInternal_()})}}},{key:"addEventListeners_",value:function(){var e=this;this.listenerInfos_.forEach(function(t){Object.keys(t).forEach(function(n){e.adapter_.registerInteractionHandler(t[n],e.listeners_[n])})}),this.adapter_.registerResizeHandler(this.resizeHandler_)}},{key:"activate_",value:function(e){var t=this,n=this.activationState_;n.isActivated||(n.isActivated=!0,n.activationEvent=e,n.wasActivatedByPointer="mousedown"===e.type||"touchstart"===e.type||"pointerdown"===e.type,n.activationStartTime=Date.now(),requestAnimationFrame(function(){n.wasElementMadeActive="keydown"!==e.type||t.adapter_.isSurfaceActive(),n.wasElementMadeActive?t.animateActivation_():t.activationState_=t.defaultActivationState_()}))}},{key:"animateActivation_",value:function(){var e=this,n=t.cssClasses,r=n.BG_ACTIVE,i=n.BG_BOUNDED_ACTIVE_FILL,o=n.FG_UNBOUNDED_DEACTIVATION,a=n.FG_BOUNDED_ACTIVE_FILL;[i,o,a].forEach(function(t){return e.adapter_.removeClass(t)}),this.cancelBgBounded_(),this.cancelFgBounded_(),this.cancelFgUnbounded_(),this.unboundedOpacityFadeTimer_&&(clearTimeout(this.unboundedOpacityFadeTimer_),this.unboundedOpacityFadeTimer_=0),this.adapter_.addClass(r),this.adapter_.isUnbounded()&&this.animateUnboundedActivation_()}},{key:"animateUnboundedActivation_",value:function(){var e=t.cssClasses.FG_UNBOUNDED_ACTIVATION;this.adapter_.addClass(e)}},{key:"deactivate_",value:function(e){var t=this,n=this.activationState_;if(n.isActivated){var r=f[e.type],i=n.activationEvent.type,o=r===i,s=o;n.wasActivatedByPointer&&(s="mouseup"===e.type);var u=a({},this.activationState_);o&&requestAnimationFrame(function(){return t.animateDeactivation_(e,u)}),s&&(this.activationState_=this.defaultActivationState_())}}},{key:"animateDeactivation_",value:function(e,n){var r=n.wasActivatedByPointer,i=n.wasElementMadeActive,o=n.activationStartTime,a=t.cssClasses.BG_ACTIVE;if(r||i){this.adapter_.removeClass(a);var s="touchend"===e.type||"pointerup"===e.type||"mouseup"===e.type;this.adapter_.isUnbounded()?this.animateUnboundedDeactivation_(this.getUnboundedDeactivationInfo_(o)):this.animateBoundedDeactivation_(e,s)}}},{key:"animateUnboundedDeactivation_",value:function(e){var n=this,r=e.opacityDuration,i=e.transformDuration,o=e.approxCurScale,a=t.cssClasses,s=a.FG_UNBOUNDED_ACTIVATION,u=a.FG_UNBOUNDED_DEACTIVATION,c=t.strings,l=c.VAR_FG_UNBOUNDED_OPACITY_DURATION,d=c.VAR_FG_UNBOUNDED_TRANSFORM_DURATION,f=c.VAR_FG_APPROX_XF;this.adapter_.updateCssVariable(f,"scale("+o+")"),this.adapter_.updateCssVariable(l,r+"ms"),this.adapter_.updateCssVariable(d,i+"ms"),this.adapter_.addClass(u),this.adapter_.removeClass(s),this.unboundedOpacityFadeTimer_=setTimeout(function(){n.adapter_.removeClass(u)},r)}},{key:"getUnboundedDeactivationInfo_",value:function(e){var n=Date.now()-e,r=t.numbers,i=r.FG_TRANSFORM_DELAY_MS,o=r.OPACITY_DURATION_DIVISOR,a=r.ACTIVE_OPACITY_DURATION_MS,s=r.UNBOUNDED_TRANSFORM_DURATION_MS,u=r.MIN_OPACITY_DURATION_MS,c=0;if(n>i){var l=Math.min((n-i)/this.xfDuration_,1);c=l*this.fgScale_}var d=s,f=Math.min(n/a,1),_=Math.max(u,1e3*f/o);return{transformDuration:d,opacityDuration:_,approxCurScale:c}}},{key:"animateBoundedDeactivation_",value:function(e,n){var r=void 0;r=n?(0,d.getNormalizedEventCoords)(e,this.adapter_.getWindowPageOffset(),this.adapter_.computeBoundingRect()):{x:this.frame_.width/2,y:this.frame_.height/2},r={x:r.x-this.initialSize_/2,y:r.y-this.initialSize_/2};var i={x:this.frame_.width/2-this.initialSize_/2,y:this.frame_.height/2-this.initialSize_/2},o=t.strings,a=o.VAR_FG_TRANSLATE_START,s=o.VAR_FG_TRANSLATE_END,u=t.cssClasses,l=u.BG_BOUNDED_ACTIVE_FILL,f=u.FG_BOUNDED_ACTIVE_FILL;this.adapter_.updateCssVariable(a,r.x+"px, "+r.y+"px"),this.adapter_.updateCssVariable(s,i.x+"px, "+i.y+"px"),this.cancelBgBounded_=(0,d.animateWithClass)(this.adapter_,l,(0,c.getCorrectEventName)(window,"transitionend")),this.cancelFgBounded_=(0,d.animateWithClass)(this.adapter_,f,(0,c.getCorrectEventName)(window,"animationend"))}},{key:"destroy",value:function(){var e=this;if(this.isSupported_){this.removeEventListeners_();var n=t.cssClasses,r=n.ROOT,i=n.UNBOUNDED;requestAnimationFrame(function(){e.adapter_.removeClass(r),e.adapter_.removeClass(i),e.removeCssVars_()})}}},{key:"removeEventListeners_",value:function(){var e=this;this.listenerInfos_.forEach(function(t){Object.keys(t).forEach(function(n){e.adapter_.deregisterInteractionHandler(t[n],e.listeners_[n])})}),this.adapter_.deregisterResizeHandler(this.resizeHandler_)}},{key:"removeCssVars_",value:function(){var e=this,n=t.strings;Object.keys(n).forEach(function(t){0===t.indexOf("VAR_")&&e.adapter_.updateCssVariable(n[t],null)})}},{key:"layout",value:function(){var e=this;this.layoutFrame_&&cancelAnimationFrame(this.layoutFrame_),this.layoutFrame_=requestAnimationFrame(function(){e.layoutInternal_(),e.layoutFrame_=0})}},{key:"layoutInternal_",value:function(){this.frame_=this.adapter_.computeBoundingRect();var e=Math.max(this.frame_.height,this.frame_.width),n=Math.sqrt(Math.pow(this.frame_.width,2)+Math.pow(this.frame_.height,2));this.initialSize_=e*t.numbers.INITIAL_ORIGIN_SCALE,this.maxRadius_=n+t.numbers.PADDING,this.fgScale_=this.maxRadius_/this.initialSize_,this.xfDuration_=1e3*Math.sqrt(this.maxRadius_/1024),this.updateLayoutCssVars_()}},{key:"updateLayoutCssVars_",value:function(){var e=t.strings,n=e.VAR_SURFACE_WIDTH,r=e.VAR_SURFACE_HEIGHT,i=e.VAR_FG_SIZE,o=e.VAR_FG_UNBOUNDED_TRANSFORM_DURATION,a=e.VAR_LEFT,s=e.VAR_TOP,u=e.VAR_FG_SCALE;this.adapter_.updateCssVariable(n,this.frame_.width+"px"),this.adapter_.updateCssVariable(r,this.frame_.height+"px"),this.adapter_.updateCssVariable(i,this.initialSize_+"px"),this.adapter_.updateCssVariable(o,this.xfDuration_+"ms"),this.adapter_.updateCssVariable(u,this.fgScale_),this.adapter_.isUnbounded()&&(this.unboundedCoords_={left:Math.round(this.frame_.width/2-this.initialSize_/2),top:Math.round(this.frame_.height/2-this.initialSize_/2)},this.adapter_.updateCssVariable(a,this.unboundedCoords_.left+"px"),this.adapter_.updateCssVariable(s,this.unboundedCoords_.top+"px"))}}]),t}(u.MDCFoundation);t.default=_},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c="mdc-select",l=[{key:"ArrowUp",keyCode:38,forType:"keydown"},{key:"ArrowDown",keyCode:40,forType:"keydown"},{key:"Space",keyCode:32,forType:"keyup"}],d=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a(t.defaultAdapter,e)));return n.ctx_=null,n.selectedIndex_=-1,n.disabled_=!1,n.displayHandler_=function(e){e.preventDefault(),n.adapter_.isMenuOpen()||n.open_()},n.displayViaKeyboardHandler_=function(e){return n.handleDisplayViaKeyboard_(e)},n.selectionHandler_=function(e){var t=e.detail,r=t.index;n.close_(),r!==n.selectedIndex_&&(n.setSelectedIndex(r),n.adapter_.notifyChange())},n.cancelHandler_=function(){n.close_()},n}return o(t,e),s(t,null,[{key:"cssClasses",get:function(){return{ROOT:c,OPEN:c+"--open",DISABLED:c+"--disabled"}}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},setAttr:function(){},rmAttr:function(){},computeBoundingRect:function(){return{left:0,top:0}},registerInteractionHandler:function(){},deregisterInteractionHandler:function(){},focus:function(){},makeTabbable:function(){},makeUntabbable:function(){},getComputedStyleValue:function(){return""},setStyle:function(){},create2dRenderingContext:function(){return{font:"",measureText:function(){return{width:0}}}},setMenuElStyle:function(){},setMenuElAttr:function(){},rmMenuElAttr:function(){},getMenuElOffsetHeight:function(){return 0},openMenu:function(){},isMenuOpen:function(){return!1},setSelectedTextContent:function(){},getNumberOfOptions:function(){return 0},getTextForOptionAtIndex:function(){return""},setAttrForOptionAtIndex:function(){},rmAttrForOptionAtIndex:function(){},getOffsetTopForOptionAtIndex:function(){return 0},registerMenuInteractionHandler:function(){},deregisterMenuInteractionHandler:function(){},notifyChange:function(){},getWindowInnerHeight:function(){return 0}}}}]),s(t,[{key:"init",value:function(){this.ctx_=this.adapter_.create2dRenderingContext(),this.adapter_.registerInteractionHandler("click",this.displayHandler_),this.adapter_.registerInteractionHandler("keydown",this.displayViaKeyboardHandler_),this.adapter_.registerInteractionHandler("keyup",this.displayViaKeyboardHandler_),this.adapter_.registerMenuInteractionHandler("MDCSimpleMenu:selected",this.selectionHandler_),this.adapter_.registerMenuInteractionHandler("MDCSimpleMenu:cancel",this.cancelHandler_),this.resize()}},{key:"destroy",value:function(){this.ctx_=null,this.adapter_.deregisterInteractionHandler("click",this.displayHandler_),this.adapter_.deregisterInteractionHandler("keydown",this.displayViaKeyboardHandler_),this.adapter_.deregisterInteractionHandler("keyup",this.displayViaKeyboardHandler_),this.adapter_.deregisterMenuInteractionHandler("MDCSimpleMenu:selected",this.selectionHandler_),this.adapter_.deregisterMenuInteractionHandler("MDCSimpleMenu:cancel",this.cancelHandler_)}},{key:"getSelectedIndex",value:function(){return this.selectedIndex_}},{key:"setSelectedIndex",value:function(e){var t=this.selectedIndex_;t>=0&&this.adapter_.rmAttrForOptionAtIndex(this.selectedIndex_,"aria-selected"),this.selectedIndex_=e>=0&&e<this.adapter_.getNumberOfOptions()?e:-1;var n="";this.selectedIndex_>=0&&(n=this.adapter_.getTextForOptionAtIndex(this.selectedIndex_).trim(),this.adapter_.setAttrForOptionAtIndex(this.selectedIndex_,"aria-selected","true")),this.adapter_.setSelectedTextContent(n)}},{key:"isDisabled",value:function(){return this.disabled_}},{key:"setDisabled",value:function(e){var n=t.cssClasses.DISABLED;this.disabled_=e,this.disabled_?(this.adapter_.addClass(n),this.adapter_.setAttr("aria-disabled","true"),this.adapter_.makeUntabbable()):(this.adapter_.removeClass(n),this.adapter_.rmAttr("aria-disabled"),this.adapter_.makeTabbable())}},{key:"resize",value:function(){var e=this.adapter_.getComputedStyleValue("font"),t=parseFloat(this.adapter_.getComputedStyleValue("letter-spacing"));if(e)this.ctx_.font=e;else{var n=this.adapter_.getComputedStyleValue("font-family").split(",")[0],r=this.adapter_.getComputedStyleValue("font-size");this.ctx_.font=r+" "+n}for(var i=0,o=0,a=this.adapter_.getNumberOfOptions();o<a;o++){var s=this.adapter_.getTextForOptionAtIndex(o).trim(),u=this.ctx_.measureText(s),c=u.width,l=t*s.length;i=Math.max(i,Math.ceil(c+l))}this.adapter_.setStyle("width",i+"px")}},{key:"open_",value:function(){var e=t.cssClasses.OPEN,n=this.selectedIndex_<0?0:this.selectedIndex_,r=this.computeMenuStylesForOpenAtIndex_(n),i=r.left,o=r.top,a=r.transformOrigin;this.adapter_.setMenuElStyle("left",i),this.adapter_.setMenuElStyle("top",o),this.adapter_.setMenuElStyle("transform-origin",a),this.adapter_.addClass(e),this.adapter_.openMenu(n)}},{key:"computeMenuStylesForOpenAtIndex_",value:function(e){var t=this.adapter_.getWindowInnerHeight(),n=this.adapter_.computeBoundingRect(),r=n.left,i=n.top;this.adapter_.setMenuElAttr("aria-hidden","true"),this.adapter_.setMenuElStyle("display","block");var o=this.adapter_.getMenuElOffsetHeight(),a=this.adapter_.getOffsetTopForOptionAtIndex(e);this.adapter_.setMenuElStyle("display",""),this.adapter_.rmMenuElAttr("aria-hidden");var s=i-a,u=o-a,c=s<0,l=s+u>t;return c?s=0:l&&(s=Math.max(0,s-u)),{left:r+"px",top:s+"px",transformOrigin:"center "+a+"px"}}},{key:"close_",value:function(){var e=t.cssClasses.OPEN;this.adapter_.removeClass(e),this.adapter_.focus()}},{key:"handleDisplayViaKeyboard_",value:function(e){var t=2;if(e.eventPhase===t){var n="keydown"===e.type&&("Space"===e.key||32===e.keyCode);n&&e.preventDefault();var r=l.some(function(t){var n=t.key,r=t.keyCode,i=t.forType;return e.type===i&&(e.key===n||e.keyCode===r)});r&&this.displayHandler_(e)}}}]),t}(u.MDCFoundation);t.default=d},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCSelect=t.MDCSelectFoundation=void 0;var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(6),l=n(27),d=r(l);t.MDCSelectFoundation=d.default;t.MDCSelect=function(e){function t(){return i(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return a(t,e),s(t,[{key:"item",value:function(e){return this.options[e]||null}},{key:"nameditem",value:function(e){for(var t,n=0,r=this.options;t=r[n];n++)if(t.id===e||t.getAttribute("name")===e)return t;return null}},{key:"initialize",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(e){return new c.MDCSimpleMenu(e)};this.menuEl_=this.root_.querySelector(".mdc-select__menu"),this.menu_=e(this.menuEl_),this.selectedText_=this.root_.querySelector(".mdc-select__selected-text")}},{key:"getDefaultFoundation",value:function(){var e=this;return new d.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},setAttr:function(t,n){return e.root_.setAttribute(t,n)},rmAttr:function(t,n){return e.root_.removeAttribute(t,n)},computeBoundingRect:function(){return e.root_.getBoundingClientRect()},registerInteractionHandler:function(t,n){return e.root_.addEventListener(t,n)},deregisterInteractionHandler:function(t,n){return e.root_.removeEventListener(t,n)},focus:function(){return e.root_.focus()},makeTabbable:function(){e.root_.tabIndex=0},makeUntabbable:function(){e.root_.tabIndex=-1},getComputedStyleValue:function(t){return window.getComputedStyle(e.root_).getPropertyValue(t)},setStyle:function(t,n){return e.root_.style.setProperty(t,n)},create2dRenderingContext:function(){return document.createElement("canvas").getContext("2d")},setMenuElStyle:function(t,n){return e.menuEl_.style.setProperty(t,n)},setMenuElAttr:function(t,n){return e.menuEl_.setAttribute(t,n)},rmMenuElAttr:function(t){return e.menuEl_.removeAttribute(t)},getMenuElOffsetHeight:function(){return e.menuEl_.offsetHeight},openMenu:function(t){return e.menu_.show({focusIndex:t})},isMenuOpen:function(){return e.menu_.open},setSelectedTextContent:function(t){e.selectedText_.textContent=t},getNumberOfOptions:function(){return e.options.length},getTextForOptionAtIndex:function(t){return e.options[t].textContent},setAttrForOptionAtIndex:function(t,n,r){return e.options[t].setAttribute(n,r)},rmAttrForOptionAtIndex:function(t,n){return e.options[t].removeAttribute(n)},getOffsetTopForOptionAtIndex:function(t){return e.options[t].offsetTop},registerMenuInteractionHandler:function(t,n){return e.menu_.listen(t,n)},deregisterMenuInteractionHandler:function(t,n){return e.menu_.unlisten(t,n)},notifyChange:function(){return e.emit("MDCSelect:change",e)},getWindowInnerHeight:function(){return window.innerHeight}})}},{key:"initialSyncWithDOM",value:function(){var e=this.selectedOptions[0],t=e?this.options.indexOf(e):-1;t>=0&&(this.selectedIndex=t),"true"===this.root_.getAttribute("aria-disabled")&&(this.disabled=!0)}},{key:"options",get:function(){return this.menu_.items}},{key:"selectedOptions",get:function(){return this.root_.querySelectorAll("[aria-selected]")}},{key:"selectedIndex",get:function(){return this.foundation_.getSelectedIndex()},set:function(e){this.foundation_.setSelectedIndex(e)}},{key:"disabled",get:function(){return this.foundation_.isDisabled()},set:function(e){this.foundation_.setDisabled(e)}}],[{key:"attachTo",value:function(e){return new t(e)}}]),t}(u.MDCComponent)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n="mdc-snackbar",r=t.cssClasses={ROOT:n,TEXT:n+"__text",ACTION_WRAPPER:n+"__action-wrapper",ACTION_BUTTON:n+"__action-button",ACTIVE:n+"--active",MULTILINE:n+"--multiline",ACTION_ON_BOTTOM:n+"--action-on-bottom"};t.strings={get TEXT_SELECTOR(){return"."+r.TEXT},get ACTION_WRAPPER_SELECTOR(){return"."+r.ACTION_WRAPPER},get ACTION_BUTTON_SELECTOR(){return"."+r.ACTION_BUTTON}},t.numbers={MESSAGE_TIMEOUT:2750}},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(29),l=function(e){function t(e){r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a(t.defaultAdapter,e)));return n.active_=!1,n.queue_=[],n.actionClickHandler_=function(){return n.invokeAction_()},n}return o(t,e),s(t,[{key:"active",get:function(){return this.active_}}],[{key:"cssClasses",get:function(){return c.cssClasses}},{key:"strings",get:function(){return c.strings}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},setAriaHidden:function(){},unsetAriaHidden:function(){},setMessageText:function(){},setActionText:function(){},setActionAriaHidden:function(){},unsetActionAriaHidden:function(){},registerActionClickHandler:function(){},deregisterActionClickHandler:function(){},registerTransitionEndHandler:function(){},deregisterTransitionEndHandler:function(){}}}}]),s(t,[{key:"init",value:function(){this.adapter_.registerActionClickHandler(this.actionClickHandler_),this.adapter_.setAriaHidden(),this.adapter_.setActionAriaHidden()}},{key:"destroy",value:function(){this.adapter_.deregisterActionClickHandler(this.actionClickHandler_)}},{key:"show",value:function(e){if(!e)throw new Error("Please provide a data object with at least a message to display.");if(!e.message)throw new Error("Please provide a message to be displayed.");if(e.actionHandler&&!e.actionText)throw new Error("Please provide action text with the handler.");if(this.active)return void this.queue_.push(e);var t=c.cssClasses.ACTIVE,n=c.cssClasses.MULTILINE,r=c.cssClasses.ACTION_ON_BOTTOM,i=c.numbers.MESSAGE_TIMEOUT;this.adapter_.setMessageText(e.message),e.multiline&&(this.adapter_.addClass(n),e.actionOnBottom&&this.adapter_.addClass(r)),e.actionHandler?(this.adapter_.setActionText(e.actionText),this.actionHandler_=e.actionHandler,this.setActionHidden_(!1)):(this.setActionHidden_(!0),this.actionHandler_=null,this.adapter_.setActionText(null)),this.active_=!0,this.adapter_.addClass(t),this.adapter_.unsetAriaHidden(),setTimeout(this.cleanup_.bind(this),e.timeout||i)}},{key:"invokeAction_",value:function(){this.actionHandler_&&this.actionHandler_()}},{key:"cleanup_",value:function(){var e=this,t=c.cssClasses.ACTIVE,n=c.cssClasses.MULTILINE,r=c.cssClasses.ACTION_ON_BOTTOM;this.adapter_.removeClass(t);var i=function t(){e.adapter_.deregisterTransitionEndHandler(t),e.adapter_.removeClass(n),e.adapter_.removeClass(r),e.setActionHidden_(!0),e.adapter_.setMessageText(null),e.adapter_.setActionText(null),e.adapter_.setAriaHidden(),e.active_=!1,e.showNext_()};this.adapter_.registerTransitionEndHandler(i)}},{key:"showNext_",value:function(){this.queue_.length&&this.show(this.queue_.shift())}},{key:"setActionHidden_",value:function(e){e?this.adapter_.setActionAriaHidden():this.adapter_.unsetActionAriaHidden()}}]),t}(u.MDCFoundation);t.default=l},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCSnackbar=t.MDCSnackbarFoundation=void 0;var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c=n(30),l=r(c),d=n(3);t.MDCSnackbarFoundation=l.default;t.MDCSnackbar=function(e){function t(){return i(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return a(t,e),s(t,[{key:"show",value:function(e){this.foundation_.show(e)}},{key:"getDefaultFoundation",value:function(){var e=this,t=l.default.strings,n=t.TEXT_SELECTOR,r=t.ACTION_BUTTON_SELECTOR,i=function(){return e.root_.querySelector(n)},o=function(){return e.root_.querySelector(r)};return new l.default({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},setAriaHidden:function(){return e.root_.setAttribute("aria-hidden","true")},unsetAriaHidden:function(){return e.root_.removeAttribute("aria-hidden")},setActionAriaHidden:function(){return o().setAttribute("aria-hidden","true")},unsetActionAriaHidden:function(){return o().removeAttribute("aria-hidden")},setActionText:function(e){o().textContent=e},setMessageText:function(e){i().textContent=e},registerActionClickHandler:function(e){return o().addEventListener("click",e)},deregisterActionClickHandler:function(e){return o().removeEventListener("click",e)},registerTransitionEndHandler:function(t){return e.root_.addEventListener((0,d.getCorrectEventName)(window,"transitionend"),t)},deregisterTransitionEndHandler:function(t){return e.root_.removeEventListener((0,d.getCorrectEventName)(window,"transitionend"),t)}})}}],[{key:"attachTo",value:function(e){return new t(e)}}]),t}(u.MDCComponent)},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=n(1),c="mdc-textfield",l=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};r(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a(t.defaultAdapter,e)));return n.receivedUserInput_=!1,n.inputFocusHandler_=function(){return n.activateFocus_()},n.inputBlurHandler_=function(){return n.deactivateFocus_()},n.inputInputHandler_=function(){return n.autoCompleteFocus_()},n.inputKeydownHandler_=function(){return n.receivedUserInput_=!0},n}return o(t,e),s(t,null,[{key:"cssClasses",get:function(){return{ROOT:c,UPGRADED:c+"--upgraded",DISABLED:c+"--disabled",FOCUSED:c+"--focused",INVALID:c+"--invalid",HELPTEXT_PERSISTENT:c+"-helptext--persistent",HELPTEXT_VALIDATION_MSG:c+"-helptext--validation-msg",LABEL_FLOAT_ABOVE:c+"__label--float-above"}}},{key:"strings",get:function(){return{ARIA_HIDDEN:"aria-hidden",ROLE:"role"}}},{key:"defaultAdapter",get:function(){return{addClass:function(){},removeClass:function(){},addClassToLabel:function(){},removeClassFromLabel:function(){},addClassToHelptext:function(){},removeClassFromHelptext:function(){},helptextHasClass:function(){return!1},registerInputFocusHandler:function(){},deregisterInputFocusHandler:function(){},registerInputBlurHandler:function(){},deregisterInputBlurHandler:function(){},registerInputInputHandler:function(){},deregisterInputInputHandler:function(){},registerInputKeydownHandler:function(){},deregisterInputKeydownHandler:function(){},setHelptextAttr:function(){},removeHelptextAttr:function(){},getNativeInput:function(){return{}}}}}]),s(t,[{key:"init",value:function(){this.adapter_.addClass(t.cssClasses.UPGRADED),this.adapter_.registerInputFocusHandler(this.inputFocusHandler_),this.adapter_.registerInputBlurHandler(this.inputBlurHandler_),this.adapter_.registerInputInputHandler(this.inputInputHandler_),this.adapter_.registerInputKeydownHandler(this.inputKeydownHandler_)}},{key:"destroy",value:function(){this.adapter_.removeClass(t.cssClasses.UPGRADED),this.adapter_.deregisterInputFocusHandler(this.inputFocusHandler_),this.adapter_.deregisterInputBlurHandler(this.inputBlurHandler_),this.adapter_.deregisterInputInputHandler(this.inputInputHandler_),this.adapter_.deregisterInputKeydownHandler(this.inputKeydownHandler_)}},{key:"activateFocus_",value:function(){var e=t.cssClasses,n=e.FOCUSED,r=e.LABEL_FLOAT_ABOVE;this.adapter_.addClass(n),this.adapter_.addClassToLabel(r),this.showHelptext_()}},{key:"autoCompleteFocus_",value:function(){this.receivedUserInput_||this.activateFocus_()}},{key:"showHelptext_",value:function(){var e=t.strings.ARIA_HIDDEN;this.adapter_.removeHelptextAttr(e)}},{key:"deactivateFocus_",value:function(){var e=t.cssClasses,n=e.FOCUSED,r=e.INVALID,i=e.LABEL_FLOAT_ABOVE,o=this.getNativeInput_(),a=o.checkValidity();this.adapter_.removeClass(n),o.value||(this.adapter_.removeClassFromLabel(i),this.receivedUserInput_=!1),a?this.adapter_.removeClass(r):this.adapter_.addClass(r),this.updateHelptextOnDeactivation_(a)}},{key:"updateHelptextOnDeactivation_",value:function(e){var n=t.cssClasses,r=n.HELPTEXT_PERSISTENT,i=n.HELPTEXT_VALIDATION_MSG,o=t.strings.ROLE,a=this.adapter_.helptextHasClass(r),s=this.adapter_.helptextHasClass(i),u=s&&!e;u?this.adapter_.setHelptextAttr(o,"alert"):this.adapter_.removeHelptextAttr(o),a||u||this.hideHelptext_()}},{key:"hideHelptext_",value:function(){var e=t.strings.ARIA_HIDDEN;this.adapter_.setHelptextAttr(e,"true")}},{key:"isDisabled",value:function(){return this.getNativeInput_().disabled}},{key:"setDisabled",value:function(e){var n=t.cssClasses.DISABLED;this.getNativeInput_().disabled=e,e?this.adapter_.addClass(n):this.adapter_.removeClass(n)}},{key:"getNativeInput_",value:function(){return this.adapter_.getNativeInput()||{checkValidity:function(){return!0},value:"",disabled:!1}}}]),t}(u.MDCFoundation);t.default=l},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MDCTextfield=t.MDCTextfieldFoundation=void 0;var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),l=n(32),d=r(l);t.MDCTextfieldFoundation=d.default;var f=d.default.cssClasses;t.MDCTextfield=function(e){function t(){var e;i(this,t);for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var s=o(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(r))),u=s.input_;return s.helptextElement=u.hasAttribute("aria-controls")?document.getElementById(u.getAttribute("aria-controls")):null,s}return a(t,e),u(t,null,[{key:"attachTo",value:function(e){return new t(e)}}]),u(t,[{key:"initialSyncWithDom",value:function(){this.disabled=this.input_.disabled}},{key:"getDefaultFoundation",value:function(){var e=this;return new d.default(s({addClass:function(t){return e.root_.classList.add(t)},removeClass:function(t){return e.root_.classList.remove(t)},addClassToLabel:function(t){var n=e.label_;n&&n.classList.add(t)},removeClassFromLabel:function(t){var n=e.label_;n&&n.classList.remove(t)}},this.getInputAdapterMethods_(),this.getHelptextAdapterMethods_()))}},{key:"getInputAdapterMethods_",value:function(){var e=this;return{registerInputFocusHandler:function(t){
    return e.input_.addEventListener("focus",t)},registerInputBlurHandler:function(t){return e.input_.addEventListener("blur",t)},registerInputInputHandler:function(t){return e.input_.addEventListener("input",t)},registerInputKeydownHandler:function(t){return e.input_.addEventListener("keydown",t)},deregisterInputFocusHandler:function(t){return e.input_.removeEventListener("focus",t)},deregisterInputBlurHandler:function(t){return e.input_.removeEventListener("blur",t)},deregisterInputInputHandler:function(t){return e.input_.removeEventListener("input",t)},deregisterInputKeydownHandler:function(t){return e.input_.removeEventListener("keydown",t)},getNativeInput:function(){return e.input_}}}},{key:"getHelptextAdapterMethods_",value:function(){var e=this;return{addClassToHelptext:function(t){e.helptextElement&&e.helptextElement.classList.add(t)},removeClassFromHelptext:function(t){e.helptextElement&&e.helptextElement.classList.remove(t)},helptextHasClass:function(t){return!!e.helptextElement&&e.helptextElement.classList.contains(t)},setHelptextAttr:function(t,n){e.helptextElement&&e.helptextElement.setAttribute(t,n)},removeHelptextAttr:function(t){e.helptextElement&&e.helptextElement.removeAttribute(t)}}}},{key:"disabled",get:function(){return this.foundation_.isDisabled()},set:function(e){this.foundation_.setDisabled(e)}},{key:"input_",get:function(){return this.root_.querySelector("."+f.ROOT+"__input")}},{key:"label_",get:function(){return this.root_.querySelector("."+f.ROOT+"__label")}}]),t}(c.MDCComponent)}])});
    !function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.autosize=n.exports}}(this,function(e,t){"use strict";function n(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),s="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),isNaN(s)&&(s=0),l()}function n(t){var n=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=n,e.style.overflowY=t}function o(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}function r(){var t=e.style.height,n=o(e),r=document.documentElement&&document.documentElement.scrollTop;e.style.height="auto";var i=e.scrollHeight+s;return 0===e.scrollHeight?void(e.style.height=t):(e.style.height=i+"px",u=e.clientWidth,n.forEach(function(e){e.node.scrollTop=e.scrollTop}),void(r&&(document.documentElement.scrollTop=r)))}function l(){r();var t=Math.round(parseFloat(e.style.height)),o=window.getComputedStyle(e,null),i=Math.round(parseFloat(o.height));if(i!==t?"visible"!==o.overflowY&&(n("visible"),r(),i=Math.round(parseFloat(window.getComputedStyle(e,null).height))):"hidden"!==o.overflowY&&(n("hidden"),r(),i=Math.round(parseFloat(window.getComputedStyle(e,null).height))),a!==i){a=i;var l=d("autosize:resized");try{e.dispatchEvent(l)}catch(e){}}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!i.has(e)){var s=null,u=e.clientWidth,a=null,p=function(){e.clientWidth!==u&&l()},c=function(t){window.removeEventListener("resize",p,!1),e.removeEventListener("input",l,!1),e.removeEventListener("keyup",l,!1),e.removeEventListener("autosize:destroy",c,!1),e.removeEventListener("autosize:update",l,!1),Object.keys(t).forEach(function(n){e.style[n]=t[n]}),i.delete(e)}.bind(e,{height:e.style.height,resize:e.style.resize,overflowY:e.style.overflowY,overflowX:e.style.overflowX,wordWrap:e.style.wordWrap});e.addEventListener("autosize:destroy",c,!1),"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",l,!1),window.addEventListener("resize",p,!1),e.addEventListener("input",l,!1),e.addEventListener("autosize:update",l,!1),e.style.overflowX="hidden",e.style.wordWrap="break-word",i.set(e,{destroy:c,update:l}),t()}}function o(e){var t=i.get(e);t&&t.destroy()}function r(e){var t=i.get(e);t&&t.update()}var i="function"==typeof Map?new Map:function(){var e=[],t=[];return{has:function(t){return e.indexOf(t)>-1},get:function(n){return t[e.indexOf(n)]},set:function(n,o){e.indexOf(n)===-1&&(e.push(n),t.push(o))},delete:function(n){var o=e.indexOf(n);o>-1&&(e.splice(o,1),t.splice(o,1))}}}(),d=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){d=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?(l=function(e){return e},l.destroy=function(e){return e},l.update=function(e){return e}):(l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return n(e,t)}),e},l.destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],o),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.exports=l});
    (function($){
    $(document).ready(function(){
    window.cf7mdId=0;
    $('.cf7md-form').each(function(){
    var $this=$(this);
    $this.siblings('p')
    .add($this.find('p'))
    .filter(function (){ return $.trim(this.innerHTML)=="" }).remove();
    $('.cf7md-text, .cf7md-textarea').find('.wpcf7-validates-as-required').each(function(){
    $(this).attr('required', 'required');
    });
    });
    $('.cf7md-item').each(function(){
    var $this=$(this),
    $span=$this.find('.wpcf7-form-control-wrap');
    $this.find('br').remove();
    $span.addClass('mdc-form-field cf');
    });
    $('.cf7md-text, .cf7md-textarea').each(function(){
    var $this=$(this),
    $input=$this.find('input, textarea'),
    $span=$this.find('.wpcf7-form-control-wrap'),
    $tpl=$this.find('.cf7md-text-html').find('> div'),
    $label=$tpl.find('label');
    $input.detach().prependTo($tpl);
    $tpl.detach().appendTo($span);
    $input.addClass('mdc-textfield__input');
    $label.attr('for', $input.attr('name'));
    if($this.hasClass('cf7md-textarea-autosize')){
    $input.attr('rows', '2');
    autosize($input);
    }});
    $('.cf7md-text [type="date"]').each(function(){
    var $this=$(this);
    $this.change(function(){
    if($this.val()!==''){
    $this.addClass('cf7md-has-input');
    }else{
    $this.removeClass('cf7md-has-input');
    }});
    });
    $('.cf7md-select').each(function(){
    var $this=$(this),
    $select=$this.find('select'),
    label=$this.find('.cf7md-select-label').text(),
    $option1=$select.children('option').first();
    if($select.hasClass('wpcf7-validates-as-required')){
    label +='*';
    }
    if($this.hasClass('cf7md-select--multi')){
    $select.addClass('mdc-multi-select mdc-list');
    $select.attr('size', '5');
    }else{
    $select.addClass('mdc-select');
    if($option1.attr('value')===''){
    $option1.text(label);
    }else{
    $option1.before('<option default selected value="">' + label + '</option>');
    }}
    });
    $('.cf7md-checkbox, .cf7md-radio').each(function(){
    var $this=$(this),
    type=$this.hasClass('cf7md-radio') ? 'radio':'checkbox',
    $items=$this.find('.wpcf7-list-item'),
    tpl=$this.find('.cf7md-' + type + '-html').html();
    $items.each(function(){
    var $item=$(this),
    $checkbox=$item.find('input'),
    $label=$item.find('.wpcf7-list-item-label'),
    $labelWrap=$label.parents('label'),
    label=$label.text(),
    $html=$(tpl).clone(),
    $wrap=$('<div class="mdc-' + type + '"></div>'),
    mdcCheckbox=$wrap[0],
    id='cf7md' + ++cf7mdId;
    $checkbox.addClass('mdc-' + type + '__native-control').attr('id', id);
    $item.addClass('cf7md-' + type + '-item mdc-form-field cf');
    $item.append($wrap);
    $label.remove();
    $labelWrap.remove();
    $checkbox.detach().appendTo($wrap);
    $wrap.append($html);
    $wrap.after('<label class="cf7md-' + type + '-label" for="' + id + '">' + label + '</label>');
    });
    });
    $('.cf7md-switch').each(function(){
    var $this=$(this),
    type='switch',
    $items=$this.find('.wpcf7-list-item'),
    tpl=$this.find('.cf7md-switch-html').html();
    $items.each(function(){
    var $item=$(this),
    $checkbox=$item.find('input'),
    $label=$item.find('.wpcf7-list-item-label'),
    $labelWrap=$label.parents('label'),
    label=$label.text(),
    $html=$(tpl).clone(),
    $switch_wrap=$html.find('.mdc-switch'),
    id='cf7md' + ++cf7mdId,
    $newlabel=$('<label for="' + id + '" class="cf7md-switch-label">' + label + '</label>');
    $checkbox.addClass('mdc-' + type + '__native-control').attr('id', id);
    $item.addClass('cf7md-' + type + '-item cf');
    $item.append($html);
    $checkbox.detach().prependTo($switch_wrap);
    $newlabel.appendTo($html);
    $label.remove();
    });
    });
    $('.cf7md-accept').each(function(){
    var $this=$(this),
    $form=$this.closest('#cf7md-form'),
    $span=$this.find('.wpcf7-form-control-wrap'),
    $checkbox=$this.find('input'),
    $tpl=$this.find('.cf7md-checkbox-html').find('> div'),
    $wrap=$('<div class="mdc-checkbox"></div>'),
    $label=$this.find('.cf7md-accept-label'),
    id='cf7md' + ++cf7mdId;
    $span.addClass('mdc-form-field');
    $checkbox.addClass('mdc-checkbox__native-control').attr('id', id);
    $span.append($wrap);
    $checkbox.detach().appendTo($wrap);
    $wrap.append($tpl);
    $label.attr('for', id);
    $label.detach().insertAfter($wrap);
    $checkbox.click(function(){
    toggleSubmit($form);
    });
    });
    function toggleSubmit($form){
    var $acceptances=$form.find('input:checkbox.wpcf7-acceptance'),
    $submit=$form.find('.cf7md-submit-btn');
    $submit.removeAttr('disabled');
    $acceptances.each(function(i, node){
    $this=$(node);
    if($this.hasClass('wpcf7-invert')&&$this.is(':checked')
    || ! $this.hasClass('wpcf7-invert')&&! $this.is(':checked')){
    $submit.attr('disabled', 'disabled');
    }});
    }
    $('.cf7md-file').each(function(){
    var $this=$(this),
    $file=$this.find('[type="file"]'),
    $value=$this.find('.cf7md-file--value'),
    $btn=$this.find('.cf7md-file--btn'),
    $label=$this.find('.cf7md-label--static'),
    $wrap=$this.find('.cf7md-file--label'),
    $error=$this.find('.wpcf7-not-valid-tip');
    $error.detach().insertAfter($wrap);
    $value.css({
    paddingLeft: $btn.outerWidth() + 12 + 'px',
    top: $btn.outerHeight() / 2 + 'px'
    });
    if($file.val()){
    fileName=$file.val().split('\\').pop();
    $value.text(fileName);
    }
    $file.on('change', function(e){
    if(e.target.value){
    fileName=e.target.value.split('\\').pop();
    $value.text(fileName);
    }});
    });
    function cf7mdQuiz(refresh){
    $('.cf7md-quiz').each(function(){
    var $this=$(this),
    $input=$this.find('.wpcf7-quiz'),
    $newInput=$input.clone(),
    $span=$this.find('.wpcf7-form-control-wrap'),
    $tpl=$this.find('.mdc-textfield'),
    $label=$tpl.find('label'),
    $question=$this.find('.wpcf7-quiz-label'),
    $cf7label=$span.find('> label');
    $label.attr('for', $input.attr('name'));
    $label.text($question.text());
    $question.hide();
    $input.detach().prependTo($tpl);
    $question.detach().prependTo($tpl);
    $tpl.detach().appendTo($span);
    $input.addClass('mdc-textfield__input');
    $cf7label.hide();
    });
    }
    cf7mdQuiz(false);
    $(window).on('wpcf7submit', function(e){
    cf7mdQuiz(true);
    });
    $('.cf7md-submit').each(function(){
    var $this=$(this),
    $form=$this.closest('#cf7md-form'),
    $inputs=$this.find('input, button');
    $inputs.each(function(){
    var $input=$(this),
    $val=$input.attr('value'),
    $svg=$this.find('svg'),
    $btn=$('<button>' + $val + '</button>');
    $btn.addClass($input[0].className);
    $btn.attr('id', $input.attr('id'));
    $btn.attr('type', $input.attr('type'));
    $btn.attr('data-mdc-auto-init', 'MDCRipple');
    $btn.addClass('cf7md-submit-btn mdc-button mdc-button--raised mdc-button--primary mdc-ripple-surface');
    $input.replaceWith($btn);
    if($input.attr('type')==='submit'){
    toggleSubmit($form);
    $btn.click(function(){
    var $spinner=$(this).parents('.cf7md-submit').find('.ajax-loader');
    $svg.detach().appendTo($spinner);
    });
    }});
    });
    setTimeout(function(){
    $('.mdc-textfield').each(function(){
    var $label=$(this).find('.mdc-textfield__label'),
    $field=$(this).find('.mdc-textfield__input'),
    val=$field.val();
    if(val){
    $label.addClass('mdc-textfield__label--float-above');
    }});
    }, 200);
    function conditionalFieldGroupToggled(event){
    $('.cf7md-file').each(function(){
    var $this=$(this),
    $file=$this.find('[type="file"]'),
    $value=$this.find('.cf7md-file--value'),
    $btn=$this.find('.cf7md-file--btn');
    $value.css({
    paddingLeft: $btn.outerWidth() + 12 + 'px',
    top: $btn.outerHeight() / 2 + 'px'
    });
    });
    }
    var MutationObserver=(function (){
    var prefixes=['WebKit', 'Moz', 'O', 'Ms', '']
    for(var i=0; i < prefixes.length; i++){
    if(prefixes[i] + 'MutationObserver' in window){
    return window[prefixes[i] + 'MutationObserver'];
    }}
    return false;
    }());
    if(MutationObserver){
    var groups=$('[data-class="wpcf7cf_group"]')
    groups.each(function(i, element){
    var observer=new MutationObserver(conditionalFieldGroupToggled);
    observer.observe(element, {
    attributes: true,
    attributeFilter: ['class'],
    childList: false,
    characterData: false
    });
    })
    }
    window.mdc.autoInit();
    });
    }(jQuery));
    WPGroHo=jQuery.extend({
    my_hash: '',
    data: {},
    renderers: {},
    syncProfileData: function(hash, id){
    if(!WPGroHo.data[hash]){
    WPGroHo.data[hash]={};
    jQuery('div.grofile-hash-map-' + hash + ' span').each(function(){
    WPGroHo.data[hash][this.className]=jQuery(this).text();
    });
    }
    WPGroHo.appendProfileData(WPGroHo.data[hash], hash, id);
    },
    appendProfileData: function(data, hash, id){
    for(var key in data){
    if(jQuery.isFunction(WPGroHo.renderers[key])){
    return WPGroHo.renderers[key](data[key], hash, id, key);
    }
    jQuery('#' + id).find('h4').after(jQuery('<p class="grav-extra ' + key + '" />').html(data[key]));
    }}
    }, WPGroHo);
    jQuery(document).ready(function(){
    if('undefined'===typeof Gravatar){
    return;
    }
    Gravatar.profile_cb=function(h, d){
    WPGroHo.syncProfileData(h, d);
    };
    Gravatar.my_hash=WPGroHo.my_hash;
    Gravatar.init('body', '#wpadminbar');
    });
    jQuery.easing.jswing=jQuery.easing.swing,jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(n,e,t,u,a){return jQuery.easing[jQuery.easing.def](n,e,t,u,a)},easeInQuad:function(n,e,t,u,a){return u*(e/=a)*e+t},easeOutQuad:function(n,e,t,u,a){return-u*(e/=a)*(e-2)+t},easeInOutQuad:function(n,e,t,u,a){return(e/=a/2)<1?u/2*e*e+t:-u/2*(--e*(e-2)-1)+t},easeInCubic:function(n,e,t,u,a){return u*(e/=a)*e*e+t},easeOutCubic:function(n,e,t,u,a){return u*((e=e/a-1)*e*e+1)+t},easeInOutCubic:function(n,e,t,u,a){return(e/=a/2)<1?u/2*e*e*e+t:u/2*((e-=2)*e*e+2)+t},easeInQuart:function(n,e,t,u,a){return u*(e/=a)*e*e*e+t},easeOutQuart:function(n,e,t,u,a){return-u*((e=e/a-1)*e*e*e-1)+t},easeInOutQuart:function(n,e,t,u,a){return(e/=a/2)<1?u/2*e*e*e*e+t:-u/2*((e-=2)*e*e*e-2)+t},easeInQuint:function(n,e,t,u,a){return u*(e/=a)*e*e*e*e+t},easeOutQuint:function(n,e,t,u,a){return u*((e=e/a-1)*e*e*e*e+1)+t},easeInOutQuint:function(n,e,t,u,a){return(e/=a/2)<1?u/2*e*e*e*e*e+t:u/2*((e-=2)*e*e*e*e+2)+t},easeInSine:function(n,e,t,u,a){return-u*Math.cos(e/a*(Math.PI/2))+u+t},easeOutSine:function(n,e,t,u,a){return u*Math.sin(e/a*(Math.PI/2))+t},easeInOutSine:function(n,e,t,u,a){return-u/2*(Math.cos(Math.PI*e/a)-1)+t},easeInExpo:function(n,e,t,u,a){return 0==e?t:u*Math.pow(2,10*(e/a-1))+t},easeOutExpo:function(n,e,t,u,a){return e==a?t+u:u*(1-Math.pow(2,-10*e/a))+t},easeInOutExpo:function(n,e,t,u,a){return 0==e?t:e==a?t+u:(e/=a/2)<1?u/2*Math.pow(2,10*(e-1))+t:u/2*(2-Math.pow(2,-10*--e))+t},easeInCirc:function(n,e,t,u,a){return-u*(Math.sqrt(1-(e/=a)*e)-1)+t},easeOutCirc:function(n,e,t,u,a){return u*Math.sqrt(1-(e=e/a-1)*e)+t},easeInOutCirc:function(n,e,t,u,a){return(e/=a/2)<1?-u/2*(Math.sqrt(1-e*e)-1)+t:u/2*(Math.sqrt(1-(e-=2)*e)+1)+t},easeInElastic:function(n,e,t,u,a){var r=1.70158,i=0,s=u;if(0==e)return t;if(1==(e/=a))return t+u;if(i||(i=.3*a),s<Math.abs(u)){s=u;r=i/4}else r=i/(2*Math.PI)*Math.asin(u/s);return-s*Math.pow(2,10*(e-=1))*Math.sin((e*a-r)*(2*Math.PI)/i)+t},easeOutElastic:function(n,e,t,u,a){var r=1.70158,i=0,s=u;if(0==e)return t;if(1==(e/=a))return t+u;if(i||(i=.3*a),s<Math.abs(u)){s=u;r=i/4}else r=i/(2*Math.PI)*Math.asin(u/s);return s*Math.pow(2,-10*e)*Math.sin((e*a-r)*(2*Math.PI)/i)+u+t},easeInOutElastic:function(n,e,t,u,a){var r=1.70158,i=0,s=u;if(0==e)return t;if(2==(e/=a/2))return t+u;if(i||(i=a*(.3*1.5)),s<Math.abs(u)){s=u;r=i/4}else r=i/(2*Math.PI)*Math.asin(u/s);return e<1?s*Math.pow(2,10*(e-=1))*Math.sin((e*a-r)*(2*Math.PI)/i)*-.5+t:s*Math.pow(2,-10*(e-=1))*Math.sin((e*a-r)*(2*Math.PI)/i)*.5+u+t},easeInBack:function(n,e,t,u,a,r){return void 0==r&&(r=1.70158),u*(e/=a)*e*((r+1)*e-r)+t},easeOutBack:function(n,e,t,u,a,r){return void 0==r&&(r=1.70158),u*((e=e/a-1)*e*((r+1)*e+r)+1)+t},easeInOutBack:function(n,e,t,u,a,r){return void 0==r&&(r=1.70158),(e/=a/2)<1?u/2*(e*e*((1+(r*=1.525))*e-r))+t:u/2*((e-=2)*e*((1+(r*=1.525))*e+r)+2)+t},easeInBounce:function(n,e,t,u,a){return u-jQuery.easing.easeOutBounce(n,a-e,0,u,a)+t},easeOutBounce:function(n,e,t,u,a){return(e/=a)<1/2.75?u*(7.5625*e*e)+t:e<2/2.75?u*(7.5625*(e-=1.5/2.75)*e+.75)+t:e<2.5/2.75?u*(7.5625*(e-=2.25/2.75)*e+.9375)+t:u*(7.5625*(e-=2.625/2.75)*e+.984375)+t},easeInOutBounce:function(n,e,t,u,a){return e<a/2?.5*jQuery.easing.easeInBounce(n,2*e,0,u,a)+t:.5*jQuery.easing.easeOutBounce(n,2*e-a,0,u,a)+.5*u+t}});
    