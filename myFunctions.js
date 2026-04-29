(function ($) {
  "use strict";

  function getSelectedMeals() {
    var selected = [];
    $("#mealsBody tr[data-meal-id]").each(function () {
      var $row = $(this);
      var isChecked = $row.find(".select-meal").is(":checked");
      if (isChecked) {
        selected.push({
          id: $row.attr("data-meal-id"),
          title: $row.children("td").eq(1).text().trim(),
          price: Number($row.attr("data-price") || 0),
          detailsHtml: $("#details-" + $row.attr("data-meal-id")).html()
        });
      }
    });
    return selected;
  }

  function setError(inputId, message) {
    $("#" + inputId + "Error").text(message || "");
  }

  function clearAllErrors() {
    setError("fullName", "");
    setError("nationalId", "");
    setError("birthDate", "");
    setError("mobile", "");
    setError("email", "");
  }

  function validateForm() {
    clearAllErrors();

    var fullName = $("#fullName").val().trim();
    var nationalId = $("#nationalId").val().trim();
    var birthDate = $("#birthDate").val().trim();
    var mobile = $("#mobile").val().trim();
    var email = $("#email").val().trim();
    var isValid = true;

    var arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
    var nationalIdRegex = /^(01|02|03|04|05|06|07|08|09|10|11|12|13|14)\d{9}$/;
    var mobileRegex = /^09(3|4|5|6|8|9)\d{7}$/;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullName && !arabicNameRegex.test(fullName)) {
      setError("fullName", "الاسم يجب أن يحتوي أحرفًا عربية فقط.");
      isValid = false;
    }

    if (!nationalId) {
      setError("nationalId", "الرقم الوطني مطلوب.");
      isValid = false;
    } else if (!nationalIdRegex.test(nationalId)) {
      setError("nationalId", "الرقم الوطني غير صحيح (11 خانة مع رمز محافظة صحيح).");
      isValid = false;
    }

    if (birthDate) {
      var parsed = new Date(birthDate);
      if (Number.isNaN(parsed.getTime())) {
        setError("birthDate", "صيغة تاريخ الولادة غير صحيحة.");
        isValid = false;
      }
    }

    if (mobile && !mobileRegex.test(mobile)) {
      setError("mobile", "رقم الموبايل يجب أن يطابق Syriatel أو MTN.");
      isValid = false;
    }

    if (email && !emailRegex.test(email)) {
      setError("email", "صيغة البريد الإلكتروني غير صحيحة.");
      isValid = false;
    }

    return isValid;
  }

  function buildSummaryHtml(selectedMeals) {
    var subtotal = 0;
    var lines = selectedMeals.map(function (meal) {
      subtotal += meal.price;
      return (
        "<div class='card'>" +
        "<p><strong>الرمز:</strong> " + meal.id + "</p>" +
        "<p><strong>الوجبة:</strong> " + meal.title + "</p>" +
        "<p><strong>السعر:</strong> " + meal.price.toLocaleString("en-US") + " ل.س</p>" +
        "<div>" + meal.detailsHtml + "</div>" +
        "</div>"
      );
    });

    var totalAfterDiscount = Math.round(subtotal * 0.95);
    lines.push("<hr>");
    lines.push("<p><strong>المجموع قبل الحسم:</strong> " + subtotal.toLocaleString("en-US") + " ل.س</p>");
    lines.push("<p><strong>قيمة الحسم (5%):</strong> " + Math.round(subtotal * 0.05).toLocaleString("en-US") + " ل.س</p>");
    lines.push("<p><strong>المبلغ النهائي بعد الحسم:</strong> " + totalAfterDiscount.toLocaleString("en-US") + " ل.س</p>");

    return "<div class='order-summary'>" + lines.join("") + "</div>";
  }

  function showSummaryInNewWindow(summaryHtml) {
    var win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("تم حظر النافذة المنبثقة. الرجاء السماح بالنوافذ المنبثقة لعرض الملخص.");
      return;
    }

    win.document.write(
      "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>ملخص الطلب</title>" +
      "<link rel='stylesheet' href='Style.css'></head><body><main class='container'><h1>ملخص الطلب</h1>" +
      summaryHtml + "</main></body></html>"
    );
    win.document.close();
  }

  $(function () {
    $(".toggle-details").on("change", function () {
      var mealId = $(this).closest("tr").attr("data-meal-id");
      $("#details-" + mealId).toggle(this.checked);
    });

    $("#continueBtn").on("click", function () {
      var selectedMeals = getSelectedMeals();
      if (!selectedMeals.length) {
        alert("الرجاء اختيار وجبة واحدة على الأقل قبل المتابعة.");
        return;
      }
      $("#orderFormSection").removeClass("hidden");
      $("html, body").animate(
        { scrollTop: $("#orderFormSection").offset().top - 20 },
        450
      );
    });

    $("#orderForm").on("submit", function (e) {
      e.preventDefault();

      var selectedMeals = getSelectedMeals();
      if (!selectedMeals.length) {
        alert("لا توجد وجبات محددة. الرجاء اختيار الوجبات أولاً.");
        return;
      }

      if (!validateForm()) {
        return;
      }

      var summaryHtml = buildSummaryHtml(selectedMeals);
      showSummaryInNewWindow(summaryHtml);
    });
  });
})(jQuery);
