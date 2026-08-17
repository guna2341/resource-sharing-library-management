package com.library.Resource.Sharing.Library.Management.constants;

public final class Regex {

    private Regex() {}

    public static final String EMAIL_REGEX =
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    public static final String PASSWORD_REGEX =
            "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=]).{8,}$";

    public static final String PHONE_REGEX =
            "^[6-9]\\d{9}$";

    public static final String USERNAME_REGEX =
            "^[a-zA-Z0-9_]{3,20}$";

}
