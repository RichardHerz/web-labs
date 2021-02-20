function c = primefit()

    x = [1e2 1e3 1e4 1e5 1e6 25e6];
    y = [0.24 0.167 0.1228 0.09591 0.078497 0.062637];
    
    lnx = log(x);
    
    c = polyfit(lnx,y,3);
   
    lnxp = linspace(lnx(1), lnx(length(lnx)), 100 )
    yp = polyval(c,lnxp);
    ypp = 0.98*yp;
    
    plot(lnx,y,'bo',lnxp,yp,'k',lnxp,ypp,'g')
    