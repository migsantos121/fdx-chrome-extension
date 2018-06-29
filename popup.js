var
  $feed = $('.feed'),
  $feedScreen = $('.feed-screen'),
  $crowdfoundingsFeedScreen = $('.crowdfoundings-feed-screen'),
  $feedContainer = $('.feed-container'),
  activeTab = "Funding",
  nextFeedPage = 1,
  nextCrowdfoundingsFeedPage = 1,
  appLink = 'https://app.fundz.net/';
  completeEventUrl = appLink + 'complete_event';

  newAppLink = 'http://34.235.221.159:80/';
  getNewsUrl = newAppLink + '/api/v1/news';
  getFundingsUrl = newAppLink + '/api/v1/fundings';
  loginUrl = newAppLink + '/api/v1/authorizations/sign_in';

  MAX_PER_PAGE = 12;
  NEWS_MAX_LENGTH = 300;
  FUNDING_MAX_LENGTH = 120;

function render_login_screen() {
  chrome.browserAction.setIcon({path: {"19": "img/icon_disable.png"}}, function(){});
  $('#notification-switch').prop('checked', false);
  $('.header').toggleClass('disable');
  $('.login-screen').show();
  $('.fundingsTabMenuContainer__tabs').hide();
}

function render_payment_screen() {
  $('#notification-switch').prop('checked', false);
  $('.header').toggleClass('disable');
  $('.login-screen').hide();
  $('.need_payment').show();
}


function uuid(){
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatMoney (n, c, d, t){
  c = isNaN(c = Math.abs(c)) ? 0 : c, 
  d = d == undefined ? "." : d, 
  t = t == undefined ? "," : t, 
  s = n < 0 ? "-" : "", 
  i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
  j = (j = i.length) > 3 ? j % 3 : 0;
 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
function getCompanySize(size){
  if (size <= 100) {
    return '10-100';
  } else if (size > 100 && size <= 200) {
    return '100-200';
  } else if (size > 200 && size <= 500) {
    return '200-500';
  } else if (size > 500 && size <= 1000) {
    return '500-1000';
  } else if (size > 1000 && size <= 2000) {
    return '1000-2000';
  }
  return '> 2000';
};


function chunkWebsite(address){
  if(!address) return '';
  const REG_EXP = /\w+\.\w+(\.\w+)?/g;
  const website = address.split('/').find(el => REG_EXP.test(el));
  return website || '';
};


function formatBody(data, maxLength = NEWS_MAX_LENGTH){
  if(!data) return "";
  if(data.length > maxLength){
    return data.slice(0, maxLength-3) + "...";
  }
  return data;
}

function NewsDataToHTML(data){
  var html = "";
  for ( i in data){
    news = data [i];
    console.log(news);
    html +=`<div>
              <div class="newsItemContainer">
                  <div class="newsItemContainer__topWrapper">
                      <div class="newsItemContainer__infoContainer">
                          <div class="newsItemContainer__nameContainer">
                              <h1 class="newsItemContainer__nameContainer__title">` + news.title + `</h1>` +
                              `<div class="newsItemContainer__nameContainer__date">` + formatDate(news.released_at) + `</div>` +
                          `</div>` +
                          `<div class="newsItemContainer__restInfo">
                            <div class="newsItemContainer__restInfo__wrapper">
                                <div class="newsItemContainer__restInfo__title">` + news.company_name + `</div>
                                <a class="newsItemContainer__restInfo__website" target="_blank" href="` + news.company_web + `">` +
                                  chunkWebsite(news.company_web) + 
                                `</a>` +
                                (news.city? (`<div class="newsItemContainer__restInfo__location">` + news.city + `</div>`): ``) +
                            `</div>
                            <div class="tags">` +
                              (news.description?(`<div class="tag lightDenim">`+news.description+`</div>`):``)+
                              (news.industry?(`<div class="tag lightOrchid">`+news.industry+`</div>`):``)+
                              (news.state?(`<div class="tag lightLime">` + news.state + `</div>`):``)+
                              (news.number_of_employees?(`<div class="tag lightPumpkin">`+getCompanySize(news.number_of_employees)+`</div>`):``)+
                            `</div>
                          </div>
                      </div>
                  </div>
                  <div class="newsItemContainer__description"><span tooltip="Click to know more">` + formatBody(news.body) + `</span></div>` +
              `</div>
            </div>`;

  }
  return html;
}

function FundingDataToHTML(data){
  var html = "";
  for ( i in data){
    funding = data [i];
    console.log(funding);

    html +=`<div>
              <div class="fundingContainer">
                  <div class="fundingContainer__topWrapper">
                      <div class="fundingContainer__topWrapper__details">
                          <div class="fundingContainer__topWrapper__details__info">` +
                              (funding.company_name?(`<p class="fundingContainer__topWrapper__details__info__title">` + funding.company_name + `</p>`):``)+
                              (funding.website?(`<a class="fundingContainer__topWrapper__details__info__website" target="_blank" href="` + funding.website + `">` +
                                                  funding.website + 
                                                `</a>`):``) +
                          `</div>
                      </div>
                      <div class="fundingContainer__topWrapper__favoriteContainer">` + 
                          (funding.accepted_at?(`<p class="fundingContainer__topWrapper__favoriteContainer__date">` + formatDate(funding.accepted_at) + `</p>`):``) +
                     `</div>
                  </div>
                  <div class="tags fundings">` + 
                    (funding.industry?(`<div class="tag lightOrchid">`+funding.industry+`</div>`):``)+
                    (funding.state_code?(`<div class="tag lightLime">` + funding.state_code + `</div>`):``)+
                    (funding.employees_number?(`<div class="tag lightPumpkin">`+getCompanySize(funding.employees_number)+`</div>`):``)+
                  `</div>` + 
                  `<div class="fundingContainer__bottomWrapper__textContainer">
                      <p class="fundingContainer__bottomWrapper__text fundingContainer__bottomWrapper__income"> Money raised: <span> $` + formatMoney(funding.money_raised) + 
                       `</span></p><span class="fundingContainer__bottomWrapper__text">` + 
                       formatBody(funding.company_description,FUNDING_MAX_LENGTH) + 
                  `</div>
              </div>
          </div>`;

  }
  return html;
}

function login(){
  var email = $('#emailInput').val();
  var password = $('#pwdInput').val();

  $.ajax({
    url: loginUrl,
    method: 'post',
    data: {
      user: {
        email: email,
        password: password,
      },
      device: {
        name: uuid(),
        token: uuid(),
      },
      platform: 'web'
    },
    dataType: "json",
    success: function(data, status, request) { 
      var authToken = request.getResponseHeader('auth-token');
      console.log("Login Complete", authToken);
      console.log(data);
      chrome.storage.local.set({'auth-token': authToken});

      activeTab = "Funding";
      $('#fundingFeed').addClass("active");
      $('#newsFeed').removeClass("active");
      $("#cfeed").removeClass('active');
      $("#crowdfoundings-cfeed").addClass('active');
      nextFeedPage = 1;
      nextCrowdfoundingsFeedPage = 1;
      $('.fundingsTabMenuContainer__tabs').show();
      $('.header').toggleClass('disable');
      get_crowdfoundings_feed_page(nextCrowdfoundingsFeedPage);
      set_notification_switch_checked_status();
      $('.login-screen').hide();
      completeEvent();
    }
  });
}
function logout() {
  chrome.storage.local.remove('auth-token');
  $("#cfeed").empty();
  $("#crowdfoundings-cfeed").empty();
  render_login_screen();
  console.log("log out");
}

function get_feed_page(page) {
  console.log("start get news");

  chrome.storage.local.get('auth-token', function(result) {
    if (authToken = result['auth-token']) {
      console.log("result auth-toekn available", authToken);
      $.ajax({
        url: getNewsUrl,
        headers: {"Auth-Token": authToken},
        data: {
          page,
          per_page: MAX_PER_PAGE,
        },
        dataType: 'json',
        success: function(data){
          console.log("end get news", data);
          nextFeedPage++;
          $('#cfeed').append(NewsDataToHTML(data));
        }
      });
    } else {
      render_login_screen();
    }
  });
}

function get_crowdfoundings_feed_page(page) {
  console.log("start get fundings");

  chrome.storage.local.get('auth-token', function(result) {
    if (authToken = result['auth-token']) {
      console.log("result auth-toekn available", authToken);
      $.ajax({
        url: getFundingsUrl,
        headers: {"Auth-Token": authToken},
        data: {
          page,
          per_page: MAX_PER_PAGE,
        },
        dataType: 'json',
        success: function(data){
          console.log("end get fundings", data);
          nextCrowdfoundingsFeedPage++;
          $('#crowdfoundings-cfeed').append(FundingDataToHTML(data));
        }
      });
    } else {
      render_login_screen();
    }
  });
}

function change_notifications_status() {
  if ($('#notification-switch').is(':checked')) {
    gcmRegistration();
  } else {
    gcmUnRegistration();
  }
}

function set_notification_switch_checked_status() {
  chrome.storage.local.get("registered", function(result) {
    if (result["registered"]) {
      chrome.browserAction.setIcon({path: {"19": "img/icon.png"}}, function(){});
      $('#notification-switch').prop('checked', true);
    }
  });
}

function update_badge_counter() {
  chrome.notifications.getAll( function(notifications){
    var notifications_count = Object.keys(notifications).length;
    if (notifications_count > 0) {
      chrome.browserAction.setBadgeText({
        text: notifications_count.toString()
      });
    } else {
      chrome.browserAction.setBadgeText({
        text: ''
      });
    }
  });
}

function sendEmail() {
  var emailUrl = "mailto:support@fundz.net";
  chrome.tabs.create({ url: emailUrl }, function(tab) {
      setTimeOut(function() {
          chrome.tabs.remove(tab.id);
      }, 500);
  });
}



function completeEvent() {
  var data = { event: 'chrome_extension' }
  $.ajax({
    url: completeEventUrl,
    method: 'POST',
    data: data
  });
}

$( document ).ready(function() {
  get_crowdfoundings_feed_page(nextCrowdfoundingsFeedPage);
  set_notification_switch_checked_status();
  completeEvent();
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    if (jqxhr.status == 401) {
      render_login_screen();
    } else if (jqxhr.status == 402) {
      render_payment_screen();
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  update_badge_counter();
  $feedScreen.bind('scroll', function () {
    if ($feedScreen.scrollTop() + $feedScreen.innerHeight() >= $feedScreen[0].scrollHeight)  {
      get_feed_page(nextFeedPage);
    }
  });

  $crowdfoundingsFeedScreen.bind('scroll', function () {
    if ($crowdfoundingsFeedScreen.scrollTop() + $crowdfoundingsFeedScreen.innerHeight() >= $crowdfoundingsFeedScreen[0].scrollHeight)  {
      get_crowdfoundings_feed_page(nextCrowdfoundingsFeedPage);
    }
  });

  $("#newsFeed").on('click', function () {
    if(activeTab !== "News"){
      activeTab = "News";
      $("#fundingFeed").toggleClass('active');
      $("#newsFeed").toggleClass('active');
      $("#cfeed").toggleClass('active');
      $("#crowdfoundings-cfeed").toggleClass('active');
      if(nextFeedPage == 1) {
        get_feed_page(nextFeedPage);
      }
    }
  });

  $('#fundingFeed').on('click', function () {
    if(activeTab !== "Funding"){
      activeTab = "Funding";
      $("#fundingFeed").toggleClass('active');
      $("#newsFeed").toggleClass('active');
      $("#cfeed").toggleClass('active');
      $("#crowdfoundings-cfeed").toggleClass('active');
      if(nextCrowdfoundingsFeedPage == 1) {
        get_crowdfoundings_feed_page(nextCrowdfoundingsFeedPage);
      }
    }
  });

  $("#notification-switch").click(function(){
    change_notifications_status();
  });

  $(".person.row").on('click', function () {
    $feedContainer.slideToggle(100);
    $(".change-person-screen").slideToggle(100);
  });

  $(".logout").on('click', function () {
    logout();
  });
  $("#loginBtn").on('click', function () {
    login();
  });
  
  $(".contact-us").on('click', function(e) {
    e.preventDefault();
    sendEmail();
  });
});
